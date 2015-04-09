<?
/**
  * profile_load.php 
  * 
  * Profile module loader
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

include_once ('./basePath.inc');
global $portal;

$menu = new Header("Profiles");

$menu->addLink(
	new Link("Edit Profile",
			 PORTALROOT . "modules/mod_profile/profile.php?action=EDIT",
			 ""
	)
);

$menu->addLink(
	new Link("List Profiles",
			 PORTALROOT . "modules/mod_profile/profile.php?action=LIST",
			 ""
	)
);

$portal->registerMenu($menu);
?>
