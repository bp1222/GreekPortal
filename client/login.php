<?
/**
  * login.inc
  * 
  * This file contains the login box for the portal
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

require ('./basePath.inc');

// Check to see if this is the login session...if it is
// in portalBase we won't print out the header HTML
// Pear::Auth uses headers and it borks if we start printing
if ($_REQUEST['login'])
	$nohtml = true;

include_once (PORTALROOT.'shared/portalBase.inc');

// Change our location ONLY if we are logging in
// NOT just displaying the login page
if ($nohtml)
{
	$portal->login($_REQUEST['auth_user'], $_REQUEST['auth_pass']);
	header ("Location: index.php");		
}
?>
<div id="login">
	<box width="1%">
		<caption>Member Login</caption>
		<form action="" name='login' method='post' onSubmit='pleaseWait();'>
			<table border='0'>
				<tr>
					<td><b>Username:</b></td>
				</tr>
				<tr>
					<td><input type='text' name='auth_user'/></td>
				</tr>
				<tr>
					<td><b>Password:</b></td>
				</tr>
				<tr>
					<td><input type='password' name='auth_pass'/></td>
				</tr>
			</table>
			<input type='submit' name='login' value='login'/>
		</form>
	</box>
</div>
