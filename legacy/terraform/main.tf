terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "eu-west-1"
}

resource "aws_db_instance" "projects" {
  identifier          = "projects-prod"
  engine              = "postgres"
  engine_version      = "15.4"
  instance_class      = "db.t3.medium"
  allocated_storage   = 20
  username            = "admin"
  password            = var.db_password
  publicly_accessible = false
  skip_final_snapshot = true
}

resource "aws_security_group" "projects_db" {
  name        = "projects-db-sg"
  description = "Security group for projects database"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_s3_bucket" "uploads" {
  bucket = "shakers-projects-uploads"
}
