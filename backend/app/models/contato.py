from pydantic import BaseModel, Field, field_validator
from app.core.security import sanitize_text


class ContatoIn(BaseModel):
    nome: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Nome completo do visitante ou membro",
        examples=["Maria Silva"],
    )
    email: str = Field(
        ...,
        min_length=5,
        max_length=100,
        pattern=r"^[^@]+@[^@]+\.[^@]+$",
        description="Endereço de e-mail para retorno",
        examples=["maria.silva@exemplo.com"],
    )
    telefone: str | None = Field(
        None,
        max_length=25,
        description="Número de WhatsApp ou telefone de contato",
        examples=["(15) 99876-5432"],
    )
    mensagem: str = Field(
        ...,
        min_length=5,
        max_length=2000,
        description="Conteúdo da mensagem ou dúvida enviada à secretaria/liderança",
        examples=["Gostaria de saber mais sobre os horários dos cultos e pequenos grupos em Tatuí."],
    )

    @field_validator("nome", "mensagem", mode="after")
    @classmethod
    def sanitize_input(cls, value: str) -> str:
        return sanitize_text(value)

    model_config = {
        "json_schema_extra": {
            "example": {
                "nome": "Maria Silva",
                "email": "maria.silva@exemplo.com",
                "telefone": "(15) 99876-5432",
                "mensagem": "Gostaria de saber mais sobre os horários dos cultos e pequenos grupos em Tatuí.",
            }
        }
    }


class OracaoIn(BaseModel):
    nome: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Nome do solicitante da oração",
        examples=["João Santos"],
    )
    telefone: str | None = Field(
        None,
        max_length=25,
        description="Telefone opcional para contato pastoral ou da equipe de intercessão",
        examples=["(15) 99123-4567"],
    )
    pedido: str = Field(
        ...,
        min_length=5,
        max_length=2000,
        description="Motivo e detalhes do pedido de oração",
        examples=["Peço oração pela saúde da minha família e por direção profissional."],
    )
    confidencial: bool = Field(
        default=False,
        description="Se verdadeiro, o pedido é visível estritamente para o pastor e líderes autorizados",
        examples=[True],
    )

    @field_validator("nome", "pedido", mode="after")
    @classmethod
    def sanitize_input(cls, value: str) -> str:
        return sanitize_text(value)

    model_config = {
        "json_schema_extra": {
            "example": {
                "nome": "João Santos",
                "telefone": "(15) 99123-4567",
                "pedido": "Peço oração pela saúde da minha família e por direção profissional.",
                "confidencial": True,
            }
        }
    }


class FormResponse(BaseModel):
    success: bool = Field(..., description="Status de sucesso do envio", examples=[True])
    message: str = Field(
        ...,
        description="Mensagem de retorno apresentada ao usuário",
        examples=["Mensagem enviada com sucesso! Em breve entraremos em contato."],
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "message": "Mensagem enviada com sucesso! Em breve entraremos em contato.",
            }
        }
    }
