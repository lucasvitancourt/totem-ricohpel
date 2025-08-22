import json
import boto3
import uuid
import base64

# Cliente do DynamoDB
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Clientes")

# Cliente S3
s3 = boto3.client("s3")
BUCKET_NAME = "avatar-totem"  # substitua pelo seu bucket

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        
        nome = body.get("nome")
        email = body.get("email")
        telefone = body.get("telefone")
        empresa = body.get("empresa")
        avatar_base64 = body.get("avatar")  # novo campo avatar

        if not (nome and email and telefone and empresa):
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Todos os campos são obrigatórios"})
            }

        avatar_s3_url = None
        if avatar_base64:
            # Gerar nome único para a imagem
            file_name = f"{uuid.uuid4()}.png"
            image_bytes = base64.b64decode(avatar_base64)

            # Enviar para o S3
            s3.put_object(
                Bucket=BUCKET_NAME,
                Key=file_name,
                Body=image_bytes,
                ContentType="image/png"
            )
            # URL pública ou path do S3 (dependendo da política do bucket)
            avatar_s3_url = f"s3://{BUCKET_NAME}/{file_name}"

        # Inserir no DynamoDB
        item = {
            "id": str(uuid.uuid4()),
            "nome": nome,
            "email": email,
            "telefone": telefone,
            "empresa": empresa,
        }

        if avatar_s3_url:
            item["avatar_url"] = avatar_s3_url

        table.put_item(Item=item)

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "message": "Cliente salvo com sucesso!",
                "dados": item
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
