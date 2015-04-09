<?
/**
	* userstruct.inc
	*
	* Describes what a user is.  In the format of ["Type"]["Name"] = "sqlval"
	* In doing this, to generate user information we need to parse
	* over the variable in the format of foreach ($userstruct as $key=>$val)
	*
	* @author		David Walker (azrail@csh.rit.edu)
	*/

include ('positions.inc');
include ('standings.inc');
 
$userstruct["info"]["Full Name"]	= "realname";
$userstruct["info"]["Address"]		= "address";
$userstruct["info"]["City"]				= "city";
$userstruct["info"]["State"]			= "state";
$userstruct["info"]["Zipcode"]		= "zip";
$userstruct["info"]["Screenname"]	= "screenname";

$userstruct["account"]["Position"]	= $positions;
$userstruct["account"]["Standing"]	= $standings;
?>
