variable "environment_name" {
  description = "Name of the automated lab environment"
  type        = string
  default     = "e-store-lab"
}

variable "vm_name" {
  description = "Name of the Hyper-V virtual machine"
  type        = string
  default     = "e-store-ubuntu-auto"
}

variable "vm_cpu_count" {
  description = "Number of virtual processors assigned to the VM"
  type        = number
  default     = 2

  validation {
    condition = var.vm_cpu_count >= 1 && var.vm_cpu_count <= 12

    error_message = "VM CPU count must be between 1 and 12."
  }
}

variable "vm_memory_min_mb" {
  description = "Minimum dynamic memory assigned to the VM in megabytes"
  type        = number
  default     = 1024
}

variable "vm_memory_startup_mb" {
  description = "Startup memory assigned to the VM in megabytes"
  type        = number
  default     = 2048
}

variable "vm_memory_max_mb" {
  description = "Maximum dynamic memory assigned to the VM in megabytes"
  type        = number
  default     = 4096
}

variable "network_name" {
  description = "Name of the Hyper-V NAT virtual switch"
  type        = string
  default     = "e-store-lab-nat"
}

variable "nat_name" {
  description = "Name of the Windows NAT instance"
  type        = string
  default     = "e-store-lab-nat"
}

variable "network_prefix" {
  description = "Private IPv4 network used by the lab"
  type        = string
  default     = "192.168.100.0/24"
}

variable "gateway_ip" {
  description = "IPv4 address of the Windows host inside the lab network"
  type        = string
  default     = "192.168.100.1"
}

variable "vm_ip" {
  description = "Static IPv4 address assigned to the Ubuntu VM"
  type        = string
  default     = "192.168.100.10"
}

variable "ssh_external_port" {
  description = "TCP port exposed on Windows for SSH access to the VM"
  type        = number
  default     = 2222

  validation {
    condition = (
      var.ssh_external_port >= 1024 &&
      var.ssh_external_port <= 65535
    )
    error_message = "SSH external port must be between 1024 and 65535."
  }
}

variable "application_external_port" {
  description = "TCP port exposed on Windows for access to the application"
  type        = number
  default     = 8080

  validation {
    condition = (
      var.application_external_port >= 1024 &&
      var.application_external_port <= 65535
    )
    error_message = "Application external port must be between 1024 and 65535."
  }
}

variable "ssh_public_key" {
  description = "Public SSH key added to the automated Ubuntu user"
  type        = string

  validation {
    condition = (
      startswith(trimspace(var.ssh_public_key), "ssh-ed25519 ") ||
      startswith(trimspace(var.ssh_public_key), "ssh-rsa ")
    )
    error_message = "SSH public key must be in OpenSSH format."
  }
}

variable "lab_root" {
  description = "Root directory used to store automated lab files"
  type        = string
  default     = "C:/Users/skmtt/HyperV/e-store-automated-lab"
}

variable "vm_mac_address" {
  description = "Static MAC address assigned to the Ubuntu VM network adapter"
  type        = string
  default     = "00155D010010"

  validation {
    condition = can(
      regex("^[0-9A-Fa-f]{12}$", var.vm_mac_address)
    )
    error_message = "VM MAC address must contain exactly 12 hexadecimal characters."
  }
}