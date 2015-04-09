<?
/**
  * alert_load.php 
  * 
	* Alert subsystem loading of module
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

include_once ('./basePath.inc');
global $portal;

// Add Privs
$portal->registerPriv("ALERT", "VIEW");
$portal->registerPriv("ALERT", "CREATE");

// Create Menu
$menu = new Header("Alerts");

$menu->addLink(new Link("View Alerts",
		"modules/mod_alert/alert.php?action=view",
		"ALERT_VIEW"));

$portal->registerMenu($menu);
?>
