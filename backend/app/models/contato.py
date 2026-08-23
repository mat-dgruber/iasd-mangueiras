from pydantic import BaseModel, Field


class ContatoIn(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    telefone: str | None = Field(None, max_length=20)
    mensagem: str = Field(..., min_length=5, max_length=2000)


class OracaoIn(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100)
    telefone: str | None = Field(None, max_length=20)
    pedido: str = Field(..., min_length=5, max_length=2000)
    confidencial: bool = False


class FormResponse(BaseModel):
    success: bool
    message: str
