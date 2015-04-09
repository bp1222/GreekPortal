<?
/**
  * wiki_load.php 
  * 
  * First function run by the module loader.  This uses
  * the module API to register this module with the system.
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

include_once ('./basePath.inc');
global $portal;

$privs = array("CREATE", "LIST", "PUBLIC_EDIT", "PRIVATE_EDIT");

// Add Privs
$portal->registerPriv("WIKI", $privs);

// Create the Menu
$menu = new Header("Wiki");

$menu->addLink(new Link("Create Page", 
		"modules/mod_wiki/wiki.php?wikiaction=createpage", 
		"WIKI_PAGE_CREATE"));
$menu->addLink(new Link ("List Wiki", 
		"modules/mod_wiki/wiki.php?wikiaction=list", 
		"WIKI_LIST"));

// Register the Menu
$portal->registerMenu($menu);

?>
