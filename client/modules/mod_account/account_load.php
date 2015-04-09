<?
/**
  * usermod_load.php 
  * 
  * First function run by the module loader.  This uses
  * the module API to register this module with the system.
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

include_once ('./basePath.inc');
global $portal;

$portal->registerPriv("USERMOD", "MODIFY");
$portal->registerPriv("USERMOD", "GETUSER");
$portal->registerPriv("USERMOD", "MODUSERMOD");

$menu = new Header("Accounts");

$menu->addLink(
	new Link("New Account",
			 PORTALROOT . "modules/mod_account/account.php?action=NEW",
			 "SYSTEM", "ADDACCOUNT"
	)
);

$menu->addLink(
	new Link("Edit Account",
			 PORTALROOT . "modules/mod_account/account.php?action=SEARCH",
			 "USERMOD", "MODIFY"
	)
);

$portal->registerMenu($menu);
?>
