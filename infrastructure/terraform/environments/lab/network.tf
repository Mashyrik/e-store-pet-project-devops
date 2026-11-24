resource "hyperv_virtual_switch" "lab" {
  name        = var.network_name
  switch_type = "NAT"

  nat_name                    = var.nat_name
  nat_internal_address_prefix = var.network_prefix
  nat_host_address            = var.gateway_ip

  notes = "NAT switch managed by Terraform for the e-store lab"
}


resource "hyperv_nat_static_mapping" "ssh" {
  nat_name = hyperv_virtual_switch.lab.nat_name
  protocol = "tcp"

  external_ip   = "0.0.0.0"
  external_port = var.ssh_external_port

  internal_ip   = var.vm_ip
  internal_port = local.ssh_internal_port

  firewall_rule = {
    enabled = true
    name    = "e-store-lab-ssh"
    profile = "Private"
  }
}

resource "hyperv_nat_static_mapping" "application" {
  nat_name = hyperv_virtual_switch.lab.nat_name
  protocol = "tcp"

  external_ip   = "0.0.0.0"
  external_port = var.application_external_port

  internal_ip   = var.vm_ip
  internal_port = local.application_internal_port

  firewall_rule = {
    enabled = true
    name    = "e-store-lab-application"
    profile = "Private"
  }
}