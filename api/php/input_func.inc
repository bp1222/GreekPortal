<?
/**
  * input_func.inc
  *
	* Input Field Functions
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

function inpText ($name, $value, $priv)
{
	global $portal;

	if ($portal->hasPriv($priv))
	{
		echo "<tr><td>";
			echo "<input type=text name=$name value=$value/>";
		echo "</td></td>";
	}
}
?>
