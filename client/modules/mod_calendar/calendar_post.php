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

require_once ('Zend/Gdata/Calendar.php');
require_once ('Zend/Http/Client.php');

Zend_Feed::registerNamespace('gd', 'http://schemas.google.com/g/2005');

$cal = new Zend_Gdata_Calendar();
$cal->setUser("bizarropete@gmail.com");
$feed = $cal->getCalendarFeed();

foreach ($feed as $feed_entry)
{
	$when = $feed_entry->when;
	var_dump ($when->getAttribute('endTime'));
}


?>















<?
/**
  * EXAMPLE Code on how to make a post to GCal	

$client = Zend_Gdata_ClientLogin::getHttpClient("bizarropete@gmail.com","PASSWORD",'cl');
$cal = new Zend_Gdata_Calendar($client);

$xmlString = <<<XML
<entry xmlns='http://www.w3.org/2005/Atom'
xmlns:gd='http://schemas.google.com/g/2005'>
<category scheme='http://schemas.google.com/g/2005#kind'
term='http://schemas.google.com/g/2005#event'></category>
<title type='text'>Tennis with Beth</title>
<content type='text'>Meet for a quick lesson.</content>
<author>
<name>Jo March</name>
<email>jo@gmail.com</email>
</author>
<gd:transparency
value='http://schemas.google.com/g/2005#event.opaque'>
</gd:transparency>
<gd:eventStatus
value='http://schemas.google.com/g/2005#event.confirmed'>
</gd:eventStatus>
<gd:where valueString='Rolling Lawn Courts'></gd:where>
<gd:when startTime='2007-04-26T15:00:00.000Z'
endTime='2007-04-26T17:00:00.000Z'></gd:when>
</entry>
XML;

$xml = new SimpleXMLElement($xmlString);

$cal->post($xml->asXML());
*/

?>
