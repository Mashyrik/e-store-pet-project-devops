variable "docker_host" {
  description = "Docker Engine API endpoint"
  type        = string
  default     = "npipe:////./pipe/dockerDesktopLinuxEngine"
}

variable "db_name" {
  description = "Name of the PostgreSQL database"
  type        = string
  default     = "e_store_lab"
}

variable "db_user" {
  description = "PostgreSQL user"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Postgres db_password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret key used to sign JWT tokens"
  type        = string
  sensitive   = true
}

variable "jwt_expiration_ms" {
  description = "JWT token lifetime in milliseconds"
  type        = number
  default     = 86400000
}

variable "app_host_port" {
  description = "Host port exposed for the application"
  type        = number
  default     = 8081
}