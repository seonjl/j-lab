# ==============================================
# Lambda Module for Next.js SSR
# ==============================================

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "memory_size" {
  type    = number
  default = 1024
}

variable "timeout" {
  type    = number
  default = 30
}

# Lambda 실행 역할
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# CloudWatch Logs 권한
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda 함수 (placeholder - 실제 배포 시 코드 업로드 필요)
resource "aws_lambda_function" "nextjs" {
  function_name = "${var.project_name}-${var.environment}-web"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "run.sh"
  runtime       = "nodejs20.x"
  memory_size   = var.memory_size
  timeout       = var.timeout

  # 실제 배포 시 S3 또는 로컬 zip으로 교체
  filename = "${path.module}/placeholder.zip"

  environment {
    variables = {
      NODE_ENV = var.environment == "prod" ? "production" : "development"
    }
  }

  lifecycle {
    ignore_changes = [filename]
  }
}

# Lambda Function URL
resource "aws_lambda_function_url" "nextjs" {
  function_name      = aws_lambda_function.nextjs.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE"]
    allow_headers = ["*"]
    max_age       = 86400
  }
}

# Outputs
output "function_arn" {
  value = aws_lambda_function.nextjs.arn
}

output "function_url" {
  value = aws_lambda_function_url.nextjs.function_url
}

output "function_name" {
  value = aws_lambda_function.nextjs.function_name
}
