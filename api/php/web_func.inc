<?
/**
  * functions.inc
  *
  * The wiki Module
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

/**
 * What we are doing here is looking for standard links to insert.
 */
function normalLinks($str) {
	$pattern = array('#(^|[^\"=]{1})(http://|ftp://|mailto:|news:)([^\s<>]+)([\s\n<>]|$)#sm',
			'/(([^\s<>]+))(@@)([^\s<>]+)\b/i');
	$replace = array('\\1<a href="\\2\\3" target="_blank">\\2\\3</a>\\4',
			'<a href="mailto:\\0">\\0</a>');
	return preg_replace($pattern, $replace, $str);
}

/**
 * We are searching the database to see if this page exists.
 * Returns 0 when no keyword exists
 */
function pageExists($str) {
	global $portal;

	$sql = "SELECT page FROM wiki WHERE page = '$str'";
	$result = $portal->dbQuery($sql);
	
	return mysql_num_rows($result);
}

/**
 * This just checks to see if a keyword is created or not.
 */
function isKeyword($str){
	$old = $str;
	if (pageExists($str)==NULL) { 
		$str .= '(?)'; 
	}
	return ' <a href="?wikiaction=create&amp;page='.$old.'">'.$str.'</a>';
}

/**
 * Simply this just checks to see if the str contains a keyword, then generates
 * the html for it.
 */
function blastLinks($str) {
	return preg_replace("/(\s|\A)([A-Z][a-z]+[A-Z][a-zA-Z]+)/e", "isKeyword($0)", $str); 
}

/**
 * Convert wiki syntax to HTML syntax.
 */
function specialNotation($str) {
	$str = htmlspecialchars($str);

	$pattern = array(
			"(\[i\])",
			"(\[\/i\])",
			"(\[u\])",
			"(\[\/u\])",
			"(\[b\])",
			"(\[\/b\])",
			"(\[img\])",
			"(\[\/img\])",
			"(\[h1\])",
			"(\[\/h1\])",
			"(\[a\])",
			"(\[\/a\])",
			"(\[link\])",
			"(\[\/link\])"
			);
	$replace = array(
			"<i>",
			"</i>",
			"<u>",
			"</u>",
			"<b>",
			"</b>",
			"<img src=\"http://",
			"\" border=\"0\">",
			"<span class=\"theader\">",
			"</span>",
			"<link>",
			"</link>",
			"<link>",
			"</link>"
			);
	return preg_replace($pattern, $replace, $str);
}

/**
 * Force links contained in [[ ]]
 */
function forceLinks($str) {
	$pattern = '/(\[\[)([^<>]+)(\]\])/';
	$replace = '<a href="?page=\\2">\\2</a>';

	return preg_replace($pattern, $replace, $str);
}

/**
 * Take the string and pass it through all of our parsing and editing
 * functions.
 */
function addBlast($str) { 
	$str = blastLinks($str);	
	$str = normalLinks($str);
	$str = specialNotation($str);
	$str = forceLinks($str);
	$str = nl2br($str);	
	return $str;
}

/**
 * Clean the page data before we insert it into the database.
 * Prevent against injections here :)
 */
function sanatize ($pagedata) {

}

function wikiFooter ($page)
{
	global $portal;

	if ($page['private'] == 1 && !$portal->hasPriv('WIKI', 'PRIVATE_EDIT'))
		return;

	if ($page['private'] == 0 && !$portal->hasPriv('WIKI', 'PUBLIC_EDIT'))
		return;

	echo "<tr><td>";
				echo "( <a href=\"modules/mod_wiki/wiki.php?wikiaction=editpage&amp;page=".$page['page']."\">edit page</a> )";
	echo "</td></tr>";
}

function getPage ($page)
{
	global $portal;

	$page = $portal->escapeString($page);
	$sql = "SELECT * FROM wiki WHERE page = '$page'";

	if ($ret = $portal->dbQuery($sql))
		return mysql_fetch_assoc($ret);
	else
		return null;
}
?>
