<?
/**
 * wiki.php
 *
 * The wiki Module
 *
 * @author		David Walker (azrail@csh.rit.edu)
 */

include_once ('./basePath.inc');
include_once (PORTALROOT.'shared/portalBase.inc');
require_once ('web_func.inc');
global $portal;

switch ($_REQUEST['action'])
{
	case "CREATE":

	break;

	case "DELETE":

	break;

	case "VIEW":
	default:
		$title = "View Calendar";
		include 'calendar_view.inc';
	break;
}
