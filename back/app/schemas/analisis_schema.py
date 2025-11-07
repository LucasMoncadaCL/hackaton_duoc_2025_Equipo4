from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

#Entrada (lo que el usuario envía desde el frontend)
class AnalisisEntrada(BaseModel):
    """
    Representa los datos de entrada que el usuario entrega para el análisis
    de salud cardiometabólico. Estos se envían al modelo de ML (Colab).
    """
    fecha: Optional[date] = None
    imc: Optional[float] # back/app/schemas/analisis_schema.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

# ---------------------------------------------------------------------------
# REQUISITO B1: Este es el "JSON Schema" validado que espera la API.
# (Tu archivo original estaba bien aquí)
# ---------------------------------------------------------------------------
class AnalisisEntrada(BaseModel):
    """
    Representa los datos de entrada que el usuario entrega para el análisis
    de salud cardiometabólico.
    """
    fecha: Optional[date] = date.today() # Mejorado: default a hoy
    imc: Optional[float] = None
    circunferencia_cintura: Optional[float] = None
    presion_sistolica: Optional[float] = None
    colesterol_total: Optional[float] = None # NOTA: Asegúrate que esto no sea un "data leak" según la rúbrica
    tabaquismo: Optional[bool] = None
    actividad_fisica: Optional[str] = None # Ej: "sedentario", "moderado", "activo"
    horas_sueno: Optional[float] = None
    
    # Datos demográficos (opcionales pero útiles para el ML)
    edad: Optional[int] = None 
    genero: Optional[str] = None # Ej: "M", "F"

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# REQUISITO A4: Respuesta del endpoint /predict
# (Este es un schema NUEVO y CRÍTICO)
# ---------------------------------------------------------------------------
class PrediccionResultado(BaseModel):
    """
    Respuesta del endpoint /predict.
    Debe devolver el score y los drivers (explicabilidad).
    """
    score: float # El riesgo predicho (0.0 a 1.0)
    drivers: List[str] # Lista de las 3-5 features que más influyeron
    categoria_riesgo: str # "Bajo", "Moderado", "Alto"

    class Config:
        from_attributes = True

# ---------------------------------------------------------------------------
# REQUISITO B2: Entrada para el endpoint /coach
# (Este es un schema NUEVO y CRÍTICO)
# ---------------------------------------------------------------------------
class CoachEntrada(BaseModel):
    """
    Datos de entrada para el endpoint /coach.
    Necesita el resultado de /predict y los datos del usuario
    para generar el plan RAG.
    """
    prediccion: PrediccionResultado
    datos_usuario: AnalisisEntrada


# ---------------------------------------------------------------------------
# REQUISITO B2: Respuesta del endpoint /coach
# (Modificado desde tu 'AnalisisResultado')
# ---------------------------------------------------------------------------
class CoachResultado(BaseModel):
    """
    Representa el resultado del coach (LLM + RAG) que se envía al frontend.
    Incluye el plan y las citas a la base de conocimiento.
    """
    plan_ia: str # El plan de acción (tu 'recomendacion_ia' renombrada)
    citas_kb: List[str] # Lista de fuentes de /kb usadas (REQUISITO B2)
    fuente_modelo: str = "NHANES_XGB_v1" # Esto está bien

    class Config:
        from_attributes = True

# ---------------------------------------------------------------------------
# (Tu 'AnalisisRegistro' para la BD está bien, solo lo ajustamos
# para que coincida con los nuevos nombres)
# ---------------------------------------------------------------------------
class AnalisisRegistro(BaseModel):
    """
    Estructura que se guarda en Supabase (tabla analisis_salud).
    Combina los datos de entrada + salida + metadatos.
    """
    id: Optional[int]
    created_at: Optional[datetime]
    usuario_id: Optional[str]

    # Datos de entrada
    fecha: Optional[date]
    imc: Optional[float]
    circunferencia_cintura: Optional[float]
    presion_sistolica: Optional[float]
    colesterol_total: Optional[float]
    tabaquismo: Optional[bool]
    actividad_fisica: Optional[str]
    horas_sueno: Optional[float]
    edad: Optional[int]
    genero: Optional[str]

    # Datos de salida (predicción + coach)
    riesgo_predicho: Optional[float]
    categoria_riesgo: Optional[str]
    drivers: Optional[List[str]] # Guardar los drivers también!
    recomendacion_ia: Optional[str] # El plan
    citas_kb: Optional[List[str]] # Las citas
    fuente_modelo: Optional[str]

    class Config:
        from_attributes = True= None
    circunferencia_cintura: Optional[float] = None
    presion_sistolica: Optional[float] = None
    colesterol_total: Optional[float] = None
    tabaquismo: Optional[bool] = None
    actividad_fisica: Optional[str] = None
    horas_sueno: Optional[float] = None

    class Config:
        orm_mode = True

#Resultado (respuesta del modelo + IA)
class AnalisisResultado(BaseModel):
    """
    Representa el resultado del análisis que se envía al frontend.
    Incluye el riesgo calculado, la categoría y el mensaje del agente IA.
    """
    riesgo_predicho: float
    categoria_riesgo: str
    recomendacion_ia: str
    fuente_modelo: str = "NHANES_XGB_v1"

    class Config:
        orm_mode = True

#Registro completo (para guardar en Supabase)
class AnalisisRegistro(BaseModel):
    """
    Estructura que se guarda en Supabase (tabla analisis_salud).
    Combina los datos de entrada + salida + metadatos.
    """
    id: Optional[int]
    created_at: Optional[datetime]
    fecha: Optional[date]
    imc: Optional[float]
    circunferencia_cintura: Optional[float]
    presion_sistolica: Optional[float]
    colesterol_total: Optional[float]
    tabaquismo: Optional[bool]
    actividad_fisica: Optional[str]
    horas_sueno: Optional[float]
    riesgo_predicho: Optional[float]
    categoria_riesgo: Optional[str]
    recomendacion_ia: Optional[str]
    fuente_modelo: Optional[str]
    usuario_id: Optional[str]

    class Config:
        from_attributes = True
