output "default_switch_id" {
  description = "ID of the existing Hyper-V Default Switch"
  value       = data.hyperv_virtual_switch.default.id
}

output "default_vm_path" {
  description = "Default path for Hyper-V virtual machine configuration"
  value       = data.hyperv_host.local.virtual_machine_path
}

output "default_vhd_path" {
  description = "Default path for Hyper-V virtual hard disks"
  value       = data.hyperv_host.local.virtual_hard_disk_path
}

output "ubuntu_server_iso_path" {
  description = "Path to the verified Ubuntu Server installer ISO"
  value       = local.ubuntu_iso_path
}

output "ubuntu_system_disk_path" {
  description = "Path to the Ubuntu VM dynamic system disk"
  value       = hyperv_vhd.ubuntu_system_disk.path
}

output "ubuntu_vm_ips" {
  description = "IP addresses reported by the Ubuntu VM"
  value       = hyperv_vm.ubuntu.ip_addresses
}
