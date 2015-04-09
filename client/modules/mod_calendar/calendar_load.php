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

$portal->registerPriv("CALENDAR", "EVENTMOD");

// Create the Menu
$menu = new Header("Calendar");

$menu->addLink(new Link("View Calendar", 
		"modules/mod_calendar/calendar.php?action=VIEW", 
		"PUBLIC"));
$menu->addLink(new Link("Add Event",
		"modules/mod_calendar/add_event.php",
		"CALENDAR", "EVENTMOD"));
$menu->addLink(new Link("Delete Event",
		"modules/mod_calendar/add_event.php",
		"CALENDAR", "EVENTMOD"));

// Register the Menu
$portal->registerMenu($menu);

?>
