# ==============================================
# Development Environment
# ==============================================

module "lambda" {
  source = "../../modules/lambda"

  project_name = "npfs"
  environment  = "dev"
  memory_size  = 512
  timeout      = 30
}

module "cloudfront" {
  source = "../../modules/cloudfront"

  project_name        = "npfs"
  environment         = "dev"
  lambda_function_url = module.lambda.function_url
}
