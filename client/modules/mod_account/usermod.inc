<?
/**
  * usermod.inc
  *
	* Modify User Accounts
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

include ("userstruct.inc");
global $portal;

if ($_REQUEST['Delete'])
{
	// Just to make sure this user has this priv
	if (!$portal->hasPriv("SYSTEM", "DELACCOUNT"))
		return;

	$portal->deleteUser($_REQUEST['username']);
}

if ($_REQUEST['Submit'])
{
	// Create if new
	if (isset($_REQUEST['newuser']))
	{
		// Just to make sure this user has this priv
		if (!$portal->hasPriv("SYSTEM", "ADDACCOUNT"))
			return;
		
		$portal->newUser($_REQUEST['username']);
		$portal->updatePassword($_REQUEST['password'], $_REQUEST['username']);
	}
	else 
	{
		if ($portal->hasPriv("SYSTEM", "CHANGEPW"))
			$portal->updatePassword($_REQUEST['passord'], $_REQUEST['username']);
	}

	$portal->updateUserstruct($_REQUEST['userstruct'], $_REQUEST['username']);

	// In case of emtpy privs for a shown sect
	// To make sure that a visable section with no checks is deleted.
	$newPriv = array();
	foreach ($_REQUEST['auth'] as $mod=>$k)
	{
		$newPriv[$mod] = array();
	}

	// Privledge Update
	if (isset($_REQUEST['privs']))
	{
		foreach ($_REQUEST['privs'] as $mod=>$val)
		{
			// Another, Just-to-be-sure
			$granting = "MOD".$mod;
			if (!$portal->hasPriv($mod, $granting))
				continue;

			foreach ($val as $priv=>$on)
			{
				$newPriv[$mod][] = $priv;
			}
		}
	}

	$portal->updatePrivs($newPriv, $_REQUEST['username']);
?>
<box>
<h2>Updated</h2>
</box>
<?
}

//
// Entry Point for Non Request
//
$user = $portal->getUser($_REQUEST['username']);

// Not set to create new user, however one can't be found.
// Time to exit!
if (!$user && !$newacct)
{
	//Really Should Throw Exception
	var_dump($_REQUEST['username']);
	var_dump("Hello");
	return;
}
?>
<box width="100%">
<?if ($newacct){?>
	<form name="userform" method="post" action="?action=NEW">
<?} else {?>
	<form name="userform" method="post" action="?action=MODIFY">
<?}?>
		<table width="100%" border="0" cellpadding="20" cellspacing="00">
			<th>
				<?if ($newacct) {?>
					<span class="theader">New User</span>
					<input type="hidden" name="newuser"/>
				<?$user['username'] = ""; // Make sure privs are empty ;)
				}else{?>
					<span class="theader">Modify User - <?=$user['username']?></span>
					<input type="hidden" name="username" value="<?=$user['username']?>"/>
				<?}?>
			</th>
			<tr valign="top">
				<td>
					<box>
						<table>

							<?if ($newacct){?>
								<tr>
									<td>Username:</td>
									<td><input type="text" name="username"/></td>
								</tr>
							<?}?>

							<tr>
								<?if($newacct){?>
									<td>Password:</td>
									<td><input type="text" name="password"/></td>
								<?}else{
									if ($portal->hasPriv("SYSTEM", "CHANGEPW")){?>
										<td>Password:</td>
										<td><input type="text" name="password" value="*****"/></td>
									<?}
								}?>
							</tr>

							<?						
							foreach ($userstruct["account"] as $key=>$val)
							{
								if (is_array($val))
								{
									echo "<tr>";
										echo "<td>$key</td>";
										echo "<td><select name=\"userstruct[$key]\">";
										if ($newacct)
											echo "<option value=\"\"/>";
									foreach ($val as $sval)
									{
										if ($user[strtolower($key)] == $sval)
											echo "<option value=\"$sval\" selected=\"true\">$sval</option>";
										else
											echo "<option value=\"$sval\">$sval</option>";
									}
									echo "</select></td>";
									echo "</tr>";
								}
								else
								{
									echo "<tr>";
										echo "<td>$key:</td>";
										echo "<td> <input type=\"text\" name=\"$val\" value=\"".$user[$val]."\"/></td>";
									echo "</tr>";
								}
							}

							echo "<br/>";

							foreach ($portal->getSysPrivs() as $mod=>$key)
							{
								// Make sure this user has ability to grant privs.
								$granting = "MOD".$mod;
								if (!$portal->hasPriv($mod, $granting))
									continue;
								
								echo "<input type=\"hidden\" name=\"auth[$mod]\" value=\"true\"/>";
								echo "<h3>$mod</h3>";
								foreach ($key as $num=>$priv)
								{
									echo "<tr><td>$priv</td>";
									if ($portal->hasPriv($mod,$priv,$user['username']))
										echo "<td><input type=\"checkbox\" name=\"privs[$mod][$priv]\" checked=\"true\"/></td></tr>";
									else
										echo "<td><input type=\"checkbox\" name=\"privs[$mod][$priv]\"/></td></tr>";
								}
							}
							?>
						</table>
						<input type="submit" name="Submit" value="Submit"/>
						<?if (!$newacct && $portal->hasPriv("SYSTEM", "DELACCOUNT")){?>
							<input type="submit" name="Delete" value="Delete"/>
						<?}?>
					</box>
				</td>
			</tr>
		</table>
	</form>
</box>
