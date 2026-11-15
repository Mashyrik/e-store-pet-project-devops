resource "hyperv_vhd" "ubuntu_system_disk" {
  path       = "${local.vms_dir}/e-store-ubuntu-system.vhdx"
  vhd_type   = "dynamic"
  size_bytes = 20 * 1024 * 1024 * 1024
}
