# ==============================================
# NPFS - National Pension Fiscal Simulator
# Terraform Root Module
# ==============================================

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state 설정 (프로덕션 배포 시 주석 해제)
  # backend "s3" {
  #   bucket         = "npfs-terraform-state"
  #   key            = "terraform.tfstate"
  #   region         = "ap-northeast-2"
  #   encrypt        = true
  #   dynamodb_table = "npfs-terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "NPFS"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# CloudFront용 ACM은 us-east-1에서만 가능
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
