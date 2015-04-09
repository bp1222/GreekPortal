<?
/**
  * usermod.php 
  * 
  * Core of the module. This handles the execution of the module
  * it will use the moduleAPI to do all of it's work, and be
  * self sustained.  The page menu is printed after the execution
  * of this script, so errors in the module will not stop the portal.
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

require ('./basePath.inc');
include_once (PORTALROOT.'shared/portalBase.inc');
require_once (PORTALROOT.'shared/web_func.inc');
global $portal;

switch($_REQUEST['action'])
{
	case "view":
		// View Current Alerts
		include "alert.inc";
	break;
}
