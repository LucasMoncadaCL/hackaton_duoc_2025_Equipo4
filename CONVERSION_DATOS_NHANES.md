# 📥 Guía de Conversión de Datos NHANES

## ⚠️ IMPORTANTE: Los datos NHANES NO vienen en CSV

Los datos de NHANES se distribuyen en formato **SAS Transport File (.XPT)** y necesitan ser convertidos a CSV antes de usar el notebook guía.

## 🔍 ¿Qué es NHANES?

El **National Health and Nutrition Examination Survey (NHANES)** es un programa del CDC que recopila datos de salud y nutrición de la población estadounidense.

- **Sitio oficial**: https://wwwn.cdc.gov/nchs/nhanes/
- **Formato**: Archivos .XPT (SAS Transport File)
- **Ciclos**: Cada 2 años (2007-2008, 2009-2010, etc.)

## 📋 Opciones para Obtener los Datos

### Opción 1: Descarga Manual (RECOMENDADO) ✅

**Paso 1: Acceder al sitio de NHANES**
1. Ve a: https://wwwn.cdc.gov/nchs/nhanes/Default.aspx
2. Selecciona el ciclo que necesitas (ej: **2007-2008**)

**Paso 2: Descargar archivos .XPT**
Para cada ciclo, descarga los siguientes módulos:
- **Demographics** (DEMO) - OBLIGATORIO
- **Examination** (EXAM) - Recomendado
- **Laboratory** (LAB) - Recomendado (para labels)
- **Questionnaire** (QUEST) - Opcional
- **Dietary** (DIET) - Opcional

**Paso 3: Convertir .XPT a CSV**

**Opción A - Script Simple (Recomendado):**

```bash
# Coloca los archivos .XPT en ./data/
# Ejemplo:
./data/
├── DEMO_2007_2008.XPT
├── EXAM_2007_2008.XPT
├── LAB_2007_2008.XPT
└── QUEST_2007_2008.XPT

# Ejecuta el script simple:
python convertir_nhanes.py
```

**Opción B - Usar Python directamente:**

```python
from nhanes_data_converter import convert_xpt_to_csv
from pathlib import Path

# Convertir todos los .XPT en ./data/
data_dir = Path('./data')
for xpt_file in data_dir.glob('*.XPT'):
    convert_xpt_to_csv(xpt_file)
```

### Opción 2: Usar el Script Automático

```python
from nhanes_data_converter import download_full_cycle

# Descargar ciclo completo
download_full_cycle('2007-2008', 
                    modules=['DEMO', 'EXAM', 'LAB', 'QUEST'],
                    output_dir='./data')
```

**⚠️ Nota**: La descarga automática puede fallar si el CDC cambia las URLs. En ese caso, usa la Opción 1.

### Opción 3: Conversión Manual con Python

Si ya tienes los archivos .XPT:

```python
import pandas as pd

# Leer archivo .XPT
df = pd.read_sas('DEMO_2007_2008.XPT', encoding='utf-8')

# Guardar como CSV
df.to_csv('DEMO_2007_2008.csv', index=False)
```

## 📁 Estructura Final Esperada

Después de la conversión, deberías tener:

```
./data/
├── DEMO_2007_2008.csv
├── EXAM_2007_2008.csv
├── LAB_2007_2008.csv
├── QUEST_2007_2008.csv
├── DEMO_2009_2010.csv
├── EXAM_2009_2010.csv
├── LAB_2009_2010.csv
└── ...
```

## 🔧 Requisitos

Asegúrate de tener pandas instalado (ya está en requirements.txt):

```bash
pip install pandas
```

Pandas incluye soporte para leer archivos SAS (.XPT) usando `pd.read_sas()`.

## 🐛 Problemas Comunes

### Error: "No module named 'sas'"

**Solución**: Instala pandas con soporte completo:

```bash
pip install pandas pyreadstat
```

O usa:

```bash
pip install pandas[all]
```

### Error al leer .XPT

**Solución**: Verifica que el archivo no esté corrupto. Descárgalo de nuevo desde el sitio oficial.

### URLs de descarga no funcionan

**Solución**: Usa la descarga manual desde https://wwwn.cdc.gov/nchs/nhanes/Default.aspx

## 📚 Referencias

- **NHANES Website**: https://wwwn.cdc.gov/nchs/nhanes/
- **NHANES Tutorials**: https://wwwn.cdc.gov/nchs/nhanes/tutorials/
- **Variable Search**: https://wwwn.cdc.gov/nchs/nhanes/search/
- **Documentación Pandas read_sas**: https://pandas.pydata.org/docs/reference/api/pandas.read_sas.html

## ✅ Checklist

Antes de ejecutar el notebook guía:

- [ ] Descargar archivos .XPT desde el sitio de NHANES
- [ ] Colocar archivos .XPT en `./data/`
- [ ] Convertir .XPT a CSV usando el script
- [ ] Verificar que los archivos CSV tengan la columna `SEQN`
- [ ] Verificar que los nombres de archivo sigan el formato: `MODULE_CYCLE.csv`

## 🎯 Ejemplo Completo

```python
# 1. Convertir un archivo .XPT a CSV
from nhanes_data_converter import convert_xpt_to_csv

convert_xpt_to_csv('./data/DEMO_2007_2008.XPT', output_dir='./data')

# 2. Convertir todos los .XPT en un directorio
from pathlib import Path

data_dir = Path('./data')
for xpt_file in data_dir.glob('*.XPT'):
    print(f"Convirtiendo: {xpt_file.name}")
    convert_xpt_to_csv(xpt_file)
    print()

# 3. Verificar que los CSV se crearon correctamente
csv_files = list(data_dir.glob('*.csv'))
print(f"✅ Archivos CSV creados: {len(csv_files)}")
for csv_file in csv_files:
    print(f"   - {csv_file.name}")
```

---

**Última actualización**: Noviembre 2025

