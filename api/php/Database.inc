<?
/**
  * databaseConnection.inc
  * 
  * Interface for database connection, and use
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

class databaseConnection 
{
	// Pointer to database connection
	private $db = null;
	
	// Create a new connection connection to the database
	public function databaseConnection () 
	{
		$this->databaseConnect();
	}

	private function databaseConnect()
	{
		// Global configuration settings for database
		global $mysql_hostname, $mysql_username, 
			   $mysql_password, $mysql_database, $mysql_sock;

		// Fail-safe, should never be needed
		if ($this->db)
		{
			return;
		}

		// If we can't connect to the database, we need to throw an error
		if (!($this->db = mysql_connect(
			"$mysql_hostname:$mysql_sock", $mysql_username, $mysql_password))) 
		{
			//throw new portalDatabaseException (200);
			var_dump($this->db);
		}

		// If we con't set the database, we need to throw an error.
		if (!mysql_select_db ($mysql_database)) 
		{
			//throw new portalDatabaseException (203);
			var_dump($this->db);
		}
	}
	
	public function portalDatabaseQuery($query) 
	{
		if (!$this->db)
			$this->databaseConnect();

		// If we can't query the database, error out.
		if (!($result = mysql_query($query, $this->db))) 
		{
			var_dump(mysql_error());
			//throw new portalDatabaseException(201);
		}

		return $result;
	}
	
	public function escapeString ($str)
	{
		if (!$this->db)
			$this->databaseConnect();

		return mysql_real_escape_string($str, $this->db);
	}
}

?>
