<? 
/**
  * index.php
  * 
	* Main page.
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

if ($_REQUEST['action'] == 'logout') 
{
	if (isset($_COOKIE[session_name()]))
		unset($_COOKIE[session_name()]);

	if (isset($_SESSION['portal']))
		unset($_SESSION['portal']);

	session_unset();

	header ("Location: index.php");
}

if ($_REQUEST['action'] == 'reload')
{
	$nohtml = true;
	include_once ('shared/portalBase.inc');
	$portal->reloadPrivs();
	header ("Location: index.php");
}

include_once ('shared/portalBase.inc');
include PORTALROOT.'modules/mod_wiki/wiki.php';
?>
