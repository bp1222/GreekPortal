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
require_once ('web_func.inc');
global $portal;

switch ($_REQUEST['action'])
{
	case 'NEW':
		$title = "Create Account";
		$newacct = true;

		if (!$portal->hasPriv('SYSTEM', 'ADDACCOUNT'))
			return;
		
		include 'usermod.inc';
		return;
	break;

	case 'GETUSER':
		if (!$portal->hasPriv('USERMOD', 'GETUSER'))
			return;

		if (isset($_REQUEST['username']))
		{
			$sql = "SELECT * FROM users WHERE username = '".$_REQUEST['username']."'";
			$result = $portal->dbQuery($sql);
			if (mysql_num_rows($result) == 1)
			{
				$title = "Account Edit";

				$user = mysql_fetch_assoc($result);
				include 'usermod.inc';
				return;
			}
		}
	break;

	case 'MODIFY':
		if (!$portal->hasPriv('USERMOD', 'MODIFY'))
			return;

		include 'usermod.inc';
	break;
	
	default:
	case 'SEARCH':
		$title = "Search Users";
		if (!$portal->hasPriv('USERMOD', 'MODIFY'))
			return;

		include 'searchuser.inc';
		return;
	break;

}
