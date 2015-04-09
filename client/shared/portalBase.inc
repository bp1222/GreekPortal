<?
/**
  * portalBase.inc
  * 
  * This is one of the main includes.
  * For the most part, this sets up all session settings
  * and creates the layout for the page template.
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

// Register our end-of-script function
register_shutdown_function (normalExit);
set_exception_handler (uncaughtException);

include_once ('./basePath.inc');

// Set our include path, so we don't need relitave paths in the includes
ini_set ("include_path", ini_get("include_path") . ":" . PORTALROOT . "../api/php:". PORTALROOT . "../api/struct");

// Include config files.
include_once ('Portal.inc');

session_start();
session_regenerate_id();

// Create page header, and load the XML stylesheets
header ("Content-type: application/xml");
if (!$nohtml) {
	echo "<?xml version='1.0' encoding='utf-8'?>\n";
	echo "<?xml-stylesheet type='text/xsl' href='".PORTALROOT."portal.xsl'?>\n";
	echo "<html>";
	echo "<body>";
}

// If there is no portal object, set one up.  It's the interface to the portal.
if (!$_SESSION['portal']) 
{
	$portal = new Portal();
	$portal->loadModules();
}
else
{
	$portal = $_SESSION['portal'];
}

function uncaughtException($e) 
{
	print $e;
}

function printMenu() 
{
	global $portal;
	include_once ('mainMenu.inc');
}

// End-Of-Script function.
// This is run whenever standard excecution is over, this
// is good because we can do cleanup, and finish the page.
function normalExit() 
{
	global $portal;

	if ($portal)
		$_SESSION['portal'] = $portal;
	printMenu();
	printFooter();
}

// Main part of the normalExit function.
// This prints the footer, and the page title.
function printFooter() 
{
	global $title;
	?>
	</body>
	<head>
		<title>SAE Portal - <?=$title?></title>
	</head>
</html>
<?}

?>
