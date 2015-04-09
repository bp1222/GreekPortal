<?

include ('errors.inc');

class PortalException extends Exception
{
	public function PortalException ($num_msg, $msg = null)
	{
		global $error;
		if (is_numeric($num_msg))
		{
			$num = $num_msg;
		} 
		else 
		{
			$msg = $num_msg;
			$num = 0;
		}

		// See if this error code has a default message.
		if ( $msg == '' )
			$msg = $error[$num];
		if ( $msg == '' )
			$msg = "Unknown error $num";

		parent::__construct($msg, $num);
	}

	public function __toString()
	{
		$ret = "<Error>";
		if ($this->getCode())
			$ret .= "<ErrorNumber>" . $this->getCode() . "</ErrorNumber>";
		if ($this->getMessage() != '')
			$ret .= "<Message>" . $this->getMessage() . "</Message>";
		$ret .= "<File>" . $this->getFile() . "</File>";
		$ret .= "<Line>" . $this->getLine() . "</Line>";
		$ret .= "</Error>";
		return $ret;
	}
}

?>
