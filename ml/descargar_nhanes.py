#!/usr/bin/env python3
"""
Script para descargar datos de NHANES desde el sitio oficial

Este script descarga archivos .XPT de NHANES usando la estructura de URL correcta.
Si la descarga automática falla, proporciona instrucciones claras para descarga manual.

Uso:
    # Descargar datasets puntuales
    python descargar_nhanes.py --cycle 2017-2018 --module DEMO BMX BPX
    
    # Usar paquetes predefinidos
    python descargar_nhanes.py --cycle 2017-2018 --bundle full-model
"""

import argparse
import sys
from pathlib import Path
import urllib.request
import urllib.error
import requests
from typing import Optional
import time

# Mapeo de ciclos a letras de archivo (usadas en nombres de archivo)
CYCLE_TO_LETTER = {
    '2007-2008': 'E',
    '2009-2010': 'F',
    '2011-2012': 'G',
    '2013-2014': 'H',
    '2015-2016': 'I',
    '2017-2018': 'J'
}

DATASET_DESCRIPTIONS = {
    'DEMO': 'Demographics',
    'BMX': 'Body Measures',
    'BPX': 'Blood Pressure',
    'GHB': 'Glycohemoglobin (HbA1c)',
    'GLU': 'Plasma Fasting Glucose',
    'TRIGLY': 'Triglycerides & LDL Cholesterol',
    'TCHOL': 'Total Cholesterol',
    'HDL': 'HDL Cholesterol',
    'INS': 'Insulin',
    'HSCRP': 'High-Sensitivity C-Reactive Protein',
    'SMQ': 'Smoking (Cigarette Use)',
    'PAQ': 'Physical Activity',
    'SLQ': 'Sleep Disorders',
    'ALQ': 'Alcohol Use',
    'DR1TOT': 'Dietary Intake (Day 1 Totals)',
    'EXAM': 'Examination bundle',
    'LAB': 'Laboratory bundle',
    'QUEST': 'Questionnaire bundle',
    'DIET': 'Dietary bundle'
}

MODULE_ALIASES = {
    'EXAM': ['BMX', 'BPX'],
    'LAB': ['GHB', 'GLU', 'TRIGLY', 'TCHOL', 'HDL', 'INS', 'HSCRP'],
    'QUEST': ['SMQ', 'PAQ', 'SLQ', 'ALQ'],
    'DIET': ['DR1TOT']
}

PRESET_BUNDLES = {
    'CORE': ['DEMO', 'BMX', 'BPX', 'GHB', 'GLU'],
    'LAB_ONLY': ['GHB', 'GLU', 'TRIGLY', 'TCHOL', 'HDL', 'INS', 'HSCRP'],
    'FULL_MODEL': [
        'DEMO', 'BMX', 'BPX', 'GHB', 'GLU', 'TRIGLY', 'TCHOL', 'HDL',
        'INS', 'HSCRP', 'SMQ', 'PAQ', 'SLQ', 'ALQ', 'DR1TOT'
    ],
}


def download_with_urllib(url: str, output_file: Path) -> bool:
    """Intenta descargar usando urllib con headers apropiados."""
    try:
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
        req.add_header('Accept', '*/*')
        req.add_header('Accept-Language', 'en-US,en;q=0.9')
        req.add_header('Referer', 'https://wwwn.cdc.gov/nchs/nhanes/Default.aspx')
        
        with urllib.request.urlopen(req, timeout=30) as response:
            content = response.read()
            
            # Verificar que no es HTML
            if content.startswith(b'<!DOCTYPE') or content.startswith(b'<html'):
                return False
            
            # Guardar archivo
            with open(output_file, 'wb') as f:
                f.write(content)
            
            return True
    except Exception:
        return False


def download_with_requests(url: str, output_file: Path) -> bool:
    """Intenta descargar usando requests con headers apropiados."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://wwwn.cdc.gov/nchs/nhanes/Default.aspx',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        }
        
        response = requests.get(url, headers=headers, timeout=30, stream=True)
        response.raise_for_status()
        
        content = response.content
        
        # Verificar que no es HTML
        if content.startswith(b'<!DOCTYPE') or content.startswith(b'<html'):
            return False
        
        # Verificar tamaño mínimo (archivos XPT son al menos unos KB)
        if len(content) < 1000:
            return False
        
        # Guardar archivo
        with open(output_file, 'wb') as f:
            f.write(content)
        
        return True
    except Exception:
        return False


def download_nhanes_file(cycle: str, module: str, output_dir: Path = Path('./data')) -> Optional[Path]:
    """
    Intenta descargar un archivo de NHANES usando la estructura de URL correcta.
    
    La URL correcta sigue el patrón:
    https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/{YEAR}/DataFiles/{MODULE}_{LETTER}.xpt
    
    Donde:
    - YEAR es el primer año del ciclo (ej: "2017" para "2017-2018")
    - MODULE es el módulo (ej: "DEMO")
    - LETTER es la letra del ciclo (ej: "J" para "2017-2018")
    
    Args:
        cycle: Ciclo de NHANES (ej: '2017-2018')
        module: Módulo (ej: 'DEMO')
        output_dir: Directorio donde guardar
    
    Returns:
        Path del archivo descargado, o None si falla
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Validar ciclo
    letter = CYCLE_TO_LETTER.get(cycle)
    if not letter:
        print(f"❌ Ciclo {cycle} no soportado")
        print(f"   Ciclos válidos: {', '.join(CYCLE_TO_LETTER.keys())}")
        return None
    
    # Construir nombre de archivo (usando letra del ciclo)
    # Los archivos se nombran como: MODULE_LETTER.xpt (ej: DEMO_J.xpt)
    filename = f"{module}_{letter}.xpt"
    output_file = output_dir / filename
    
    # Si ya existe, no descargar de nuevo
    if output_file.exists():
        print(f"✅ Archivo ya existe: {filename}")
        print(f"   Tamaño: {output_file.stat().st_size / (1024*1024):.2f} MB")
        return output_file
    
    # Extraer el primer año del ciclo para la URL
    # Ejemplo: "2017-2018" -> "2017"
    year = cycle.split('-')[0]
    
    # Construir URL correcta basada en el patrón real del sitio
    # Patrón: https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/{YEAR}/DataFiles/{filename}
    url = f"https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/{year}/DataFiles/{filename}"
    
    # URLs alternativas por si la principal cambia (fallback)
    urls_to_try = [
        url,  # URL principal (correcta)
        f"https://wwwn.cdc.gov/Nchs/Nhanes/{cycle.replace('-', '/')}/{filename}",
        f"https://wwwn.cdc.gov/nchs/nhanes/{cycle.replace('-', '/')}/{filename}",
    ]
    
    print(f"📥 Descargando {filename}")
    print(f"   Ciclo: {cycle} ({DATASET_DESCRIPTIONS.get(module, module)})")
    print(f"   Año en URL: {year}")
    print()
    
    for i, url in enumerate(urls_to_try, 1):
        print(f"   [{i}/{len(urls_to_try)}] Intentando: {url}")
        
        # Intentar con requests primero (más robusto)
        if download_with_requests(url, output_file):
            size = output_file.stat().st_size
            print(f"   ✅ Descarga exitosa!")
            print(f"   📊 Tamaño: {size / (1024*1024):.2f} MB ({size:,} bytes)")
            
            # Verificar que sea un archivo XPT válido
            with open(output_file, 'rb') as f:
                header = f.read(80)
                if b'HEADER RECORD' in header or b'XPORT' in header or (size > 1000 and not header.startswith(b'<!DOCTYPE')):
                    print(f"   ✅ Archivo XPT válido detectado")
                    return output_file
                else:
                    print(f"   ⚠️  Archivo descargado pero no parece ser XPT válido")
                    output_file.unlink()
                    continue
        
        # Intentar con urllib como fallback
        if download_with_urllib(url, output_file):
            size = output_file.stat().st_size
            print(f"   ✅ Descarga exitosa (con urllib)!")
            print(f"   📊 Tamaño: {size / (1024*1024):.2f} MB ({size:,} bytes)")
            
            # Verificar que sea un archivo XPT válido
            with open(output_file, 'rb') as f:
                header = f.read(80)
                if b'HEADER RECORD' in header or b'XPORT' in header or (size > 1000 and not header.startswith(b'<!DOCTYPE')):
                    print(f"   ✅ Archivo XPT válido detectado")
                    return output_file
                else:
                    print(f"   ⚠️  Archivo descargado pero no parece ser XPT válido")
                    output_file.unlink()
                    continue
        
        print(f"   ❌ No se pudo descargar desde esta URL")
        if i < len(urls_to_try):
            time.sleep(1)  # Pequeña pausa entre intentos
    
    # Si todas las URLs fallan, proporcionar instrucciones
    print()
    print("="*70)
    print("⚠️  DESCARGA AUTOMÁTICA FALLÓ")
    print("="*70)
    print()
    print("💡 INSTRUCCIONES PARA DESCARGA MANUAL:")
    print()
    print(f"1. Ve a: https://wwwn.cdc.gov/nchs/nhanes/Default.aspx")
    print(f"2. Selecciona el ciclo: {cycle}")
    print(f"3. Busca el módulo: {DATASET_DESCRIPTIONS.get(module, module)}")
    print(f"4. Descarga el archivo: {filename}")
    print(f"5. Colócalo en: {output_file}")
    print()
    print(f"📋 Información del archivo:")
    print(f"   - Nombre esperado: {filename}")
    print(f"   - Módulo: {DATASET_DESCRIPTIONS.get(module, module)}")
    print(f"   - Ciclo: {cycle}")
    print(f"   - Letra: {letter}")
    print()
    
    return None


def main():
    """Función principal del script."""
    parser = argparse.ArgumentParser(
        description='Descargar archivos .XPT de NHANES desde el sitio oficial',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  # Descargar datasets específicos
  python descargar_nhanes.py --cycle 2017-2018 --module DEMO BMX BPX
  
  # Descargar los datasets clave del modelo
  python descargar_nhanes.py --cycle 2017-2018 --bundle full-model
  
  # Combinar bundles y módulos individuales
  python descargar_nhanes.py --ciclo 2017-2018 --bundle core --modulo TRIGLY HSCRP
        """
    )
    
    # Soporte para español e inglés
    parser.add_argument('--cycle', '--ciclo', dest='cycle', required=True,
                       help='Ciclo de NHANES (ej: 2017-2018)')
    parser.add_argument('--module', '--modulo', dest='modules', nargs='+',
                       help='Datasets a descargar (ej: DEMO, BMX, BPX, GHB, GLU, etc.)')
    parser.add_argument('--bundle', '--paquete', dest='bundles', nargs='+',
                       help='Paquetes predefinidos: core, lab-only, full-model')
    parser.add_argument('--output-dir', '--directorio-salida', dest='output_dir',
                       default='./data', help='Directorio donde guardar archivos')
    
    args = parser.parse_args()
    
    print("="*70)
    print("📥 DESCARGADOR DE DATOS NHANES")
    print("="*70)
    print()
    
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Validar ciclo
    if args.cycle not in CYCLE_TO_LETTER:
        print(f"❌ Ciclo no válido: {args.cycle}")
        print(f"   Ciclos válidos: {', '.join(CYCLE_TO_LETTER.keys())}")
        sys.exit(1)
    
    def normalize_key(value: str) -> str:
        return value.replace('-', '_').upper()
    
    requested_modules = []
    
    if args.bundles:
        available_bundles = {key: PRESET_BUNDLES[key] for key in PRESET_BUNDLES}
        for bundle in args.bundles:
            bundle_key = normalize_key(bundle)
            if bundle_key not in available_bundles:
                readable_bundles = ', '.join(sorted(name.lower().replace('_', '-') for name in available_bundles))
                print(f"❌ Bundle no válido: {bundle}")
                print(f"   Bundles disponibles: {readable_bundles}")
                sys.exit(1)
            requested_modules.extend(available_bundles[bundle_key])
    
    if args.modules:
        requested_modules.extend(normalize_key(m) for m in args.modules)
    
    if not requested_modules:
        print("❌ Debes indicar al menos un módulo (--module) o un bundle predefinido (--bundle).")
        sys.exit(1)
    
    # Expandir alias (EXAM, LAB, etc.) y validar datasets
    expanded_modules = []
    invalid_modules = []
    seen = set()
    
    def add_dataset(dataset_code: str):
        if dataset_code not in DATASET_DESCRIPTIONS:
            invalid_modules.append(dataset_code)
            return
        if dataset_code not in seen:
            seen.add(dataset_code)
            expanded_modules.append(dataset_code)
    
    for module in requested_modules:
        if module in MODULE_ALIASES:
            for dataset in MODULE_ALIASES[module]:
                add_dataset(dataset)
        else:
            if module not in DATASET_DESCRIPTIONS:
                invalid_modules.append(module)
            else:
                add_dataset(module)
    
    if invalid_modules:
        valid_inputs = sorted({key.lower() for key in DATASET_DESCRIPTIONS} | {key.lower() for key in MODULE_ALIASES})
        print(f"❌ Módulos no válidos: {', '.join(sorted(set(invalid_modules)))}")
        print(f"   Valores permitidos: {', '.join(valid_inputs)}")
        sys.exit(1)
    
    print("🎯 Datasets objetivo:")
    for module in expanded_modules:
        readable = DATASET_DESCRIPTIONS.get(module, module)
        print(f"   - {module} ({readable})")
    print()
    
    # Descargar cada dataset
    downloaded = []
    failed = []
    
    for module in expanded_modules:
        result = download_nhanes_file(args.cycle, module, output_dir)
        if result:
            downloaded.append((module, result))
        else:
            failed.append(module)
        print()
    
    # Resumen
    print("="*70)
    print("📊 RESUMEN")
    print("="*70)
    print()
    
    if downloaded:
        print(f"✅ Archivos descargados exitosamente: {len(downloaded)}")
        for module, path in downloaded:
            size = path.stat().st_size
            readable = DATASET_DESCRIPTIONS.get(module, module)
            print(f"   - {path.name} ({readable}) → {size / (1024*1024):.2f} MB")
        print()
        print("💡 Próximo paso: Convierte a CSV usando:")
        print("   python convertir_nhanes.py")
    
    if failed:
        print(f"⚠️  Archivos que requieren descarga manual: {len(failed)}")
        for m in failed:
            readable = DATASET_DESCRIPTIONS.get(m, m)
            print(f"   - {m} ({readable})")
        print()
        print("💡 Descarga manual desde:")
        print("   https://wwwn.cdc.gov/nchs/nhanes/Default.aspx")
    
    print()
    print("="*70)


if __name__ == "__main__":
    main()

