from pydantic import BaseModel, Field


class LicaoHojeResponse(BaseModel):
    titulo: str = Field(..., description="Título da lição da semana da Escola Sabatina")
    tema: str = Field(..., description="Tema geral do trimestre")
    trimestre: str = Field(..., description="Identificação do trimestre e ano")
    versiculo_dia: str = Field(..., description="Texto do versículo para reflexão do dia")
    referencia: str = Field(..., description="Referência bíblica do versículo")
    link_cpb: str = Field(..., description="Link oficial para leitura completa no portal da CPB")
    licao_numero: int = Field(default=1, description="Número da lição da semana")
