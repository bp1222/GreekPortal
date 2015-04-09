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

if (!isset($_REQUEST['page']))
{
	if ($portal->isAuth())
		$page = 'Brothers Home';
	else
		$page = 'Public Home'; 
}
else
{
	$page = $_REQUEST['page'];
}

$page_info = getPage($page);

// Haha, don't let them un-authed to see what pages really exist!
if ((!$portal->isAuth() && $page_info['private'] == 1) || 
		($page_info == null && !$_REQUEST['wikiaction']))
{
?>
	<box width="100%">
		<span class="theader">This page does not seem to exist in our system.</span>
		<?if ($portal->hasPriv("WIKI", "CREATE") && $page_info == null){?>
			<br/>
			<a href="<?=PORTALROOT."modules/mod_wiki/wiki.php?wikiaction=createpage&amp;page=$page"?>">Create this page</a>
		<?}?>
	</box>
<?		
	return;
}

switch ($_REQUEST['wikiaction'])
{
	case "editpage":
		$new = false;
		include_once ('page_edit.php');
		break;
	case "createpage":
		$new = true;
		include_once ('page_edit.php');
		break;
	case "list":
		include_once ('list.inc');
		break;
	default:
?>
		<box width="100%">
			<tr valign='top' height='200px'>
				<td class='smallfont'>
					<?=addBlast($page_info['content'])?>
				</td>
			</tr>
			<tr align="right">
				<td align="right">
					<?=wikiFooter($page_info)?>
				</td>
			</tr>
		</box>
<?
		break;
}
?>
