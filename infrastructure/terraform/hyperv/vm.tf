resource "hyperv_vm" "ubuntu" {
  name       = "e-store-ubuntu"
  generation = 2

  cpu = {
    count = 2
  }

  memory = {
    startup_bytes = 2 * 1024 * 1024 * 1024
    dynamic       = true
    min_bytes     = 1 * 1024 * 1024 * 1024
    max_bytes     = 4 * 1024 * 1024 * 1024
  }

  secure_boot = false

  network_adapter = [
    {
      name        = "primary"
      switch_name = data.hyperv_virtual_switch.default.name
    }
  ]

  hard_disk_drive = [
    {
      path                = hyperv_vhd.ubuntu_system_disk.path
      controller_type     = "SCSI"
      controller_number   = 0
      controller_location = 0
    }
  ]

  boot_order = [
    {
      type                = "hard_disk_drive"
      controller_type     = "SCSI"
      controller_number   = 0
      controller_location = 0
    }
  ]

  depends_on = [
    terraform_data.ubuntu_server_iso,
    hyperv_vhd.ubuntu_system_disk
  ]
}

resource "terraform_data" "start_ubuntu_vm" {
  input = hyperv_vm.ubuntu.id

  provisioner "local-exec" {
    interpreter = ["PowerShell", "-NoProfile", "-Command"]
    command     = "Set-VM -Name 'e-store-ubuntu' -AutomaticCheckpointsEnabled $false; Start-VM -Name 'e-store-ubuntu'"
  }

  depends_on = [hyperv_vm.ubuntu]
}
