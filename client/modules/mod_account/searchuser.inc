<?
/**
  * edituser.inc
  *
	* Edit user accounts within the system.
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */
?>
<box width="100%">
	<table width="100%" border="0" cellpadding="20" cellspacing="00">
		<th>
			<span class="theader">Search Users</span>
		</th>
		<tr valign="top">
			<td>
				<form method="post" action="">
					Username: <input type="text" name="username"/>

					<input type="hidden" name="action" value="GETUSER"/>
					<input type="submit" name="submit"/>
				</form>
			</td>
		</tr>
	</table>
</box>
