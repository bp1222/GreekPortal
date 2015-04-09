<?
/**
 * edit.inc
 *
 * The wiki Module
 *
 * @author		David Walker (azrail@csh.rit.edu)
 */

//$page = mysql_escape_string($_REQUEST['page']);

if ($_REQUEST['submit'])
{
	$added = 0;
	$private = $_REQUEST['private'] == "on" ? 1 : 0;
	$content = $_REQUEST['content'];
	unset ($errors);
	
	if ($page == "" || !isset($page))
	{
		$errors['page'] = true;
	}

	// Put other error checking above this... I don't want to display
	// privledge error unless we have to.
	if ((($private == 1 && !$portal->hasPriv("WIKI", "PRIVATE_EDIT")) ||
	   ($private == 0 && !$portal->hasPriv("WIKI", "PUBLIC_EDIT")))
		 && !isset($errors))
	{
?>
		<box>
			Sorry you are not allowed to preform that action.
		</box>
<?
		return;
	}

	if ($content == "") 
	{
		$content = null;
	}

	if (!isset($errors)) {
		if (pageExists($page))
		{ 
			$sql = "UPDATE wiki SET content = '$content', private = '$private' WHERE page = '$page'";
			$portal->dbQuery($sql);
		}
		else
		{
			$sql = "INSERT INTO wiki 
						(page, private, content) 
						VALUES 
						('$page', '$private', '$content')";
			$portal->dbQuery($sql);
			$added = 1;
		}
	
?>
		<box width="100%">
			<table width="100%" border="0" cellpadding="20" cellspacing="00">
			<th>
				<?if ($added) {?>
					<?=$page?> - Has been added to system.
					<a href="?page=<?=$page?>">View Changes</a>
				<?} else {?>
					<?=$page?> - Has been modified.<br/>
					<a href="?page=<?=$page?>">View Changes</a>
				<?}?>
				</th>
			</table>
		</box>
<?
		return;
	}
}


if (!$errors)
{
	$sql = "SELECT * FROM wiki WHERE page = '$page'";
	$result = mysql_fetch_assoc($portal->dbQuery($sql));

	if ($exist = pageExists($page)){
		$content = $result['content'];
		$private = $result['private'];
	}
}

if (((($result['private'] == 1 && !$portal->hasPriv("WIKI", "PRIVATE_EDIT")) ||
    ($result['private'] == 0 && !$portal->hasPriv("WIKI", "PUBLIC_EDIT")))) ||
		($result['private'] == 0 && !$portal->hasPriv("WIKI", "CREATE"))){
?>
	<box>
		Sorry you are not authorized to view this page.
	</box>
<?
	return;
}?>
<box width="100%">
	<table width="100%" border="0" cellpadding="20" cellspacing="00">
		<th>
			<?if ($exist) {?>
				<span class="theader">Editing Page - <?=$page?></span>
			<?} else {?>
				<span class="theader">Creating Page - <?=$page?></span>
			<?}?>
		</th>
		<tr valign='top' height='300'>
			<td>
				<form method="post" action="">
					<?if($exist) {?>
						<input type="hidden" name="page" disabled="true" value="<?=$page?>"/>
					<?} else {
						if ($errors['page']){?>
							ERR - Page Name: <input type="text" name="page" value="<?=$page?>"/>
						<?} else {?>
							Page Name: <input type="text" name="page" value="<?=$page?>"/>
						<?}?>
						<br/>
					<?}?>
					Content:
					<br/>
					<textarea rows="25" cols="50" name="content"><?=$content?></textarea>
					<br/>
					<?if ($private){?>
						<input type="checkbox" name="private" checked="yes"/> Private
					<?} else {?>
						<input type="checkbox" name="private"/> Private
					<?}?>
					<br/>
					<?if ($exist){?>
						<input type="submit" name="submit" value="Edit"/>
					<?} else {?>
						<input type="submit" name="submit" value="Create"/>
					<?}?>
				</form>
			</td>
		</tr>
	</table>
</box>
