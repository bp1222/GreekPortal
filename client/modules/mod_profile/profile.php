<?
/**
  * profile.php 
  * 
  * Profile module
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

require ('./basePath.inc');
include_once (PORTALROOT.'shared/portalBase.inc');
global $portal;

switch ($_REQUEST['action'])
{
	case 'EDIT':
		$edit = true;
		$username = $portal->getUsername();
		include 'profile.inc';
	break;

	case 'VIEW':
		$username = $_REQUEST['member'];
		if (is_null($username) || $username == "")
			include 'listMembers.inc';
		else
			include 'profile.inc';
	break;

	case 'MODIFY':
		$username = $portal->getUsername();
		if ($_REQUEST['member'] != $username)
		{
			echo "You can only edit your profile";
			break;
		}
		include 'profile.inc';
	break;

	case 'LIST':
	default:
		include 'listMembers.inc';
	break;
}
?>
