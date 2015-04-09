<?
/**
  * user.inc
  * 
	* User class.  Containst information about a given user.  It does not keep
	* track if the given user is the authenticated user or not, but will hold
	* the list of privledges this user has.
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

class User
{
	// Name of this user
	private $username = null;

	// List of privledges this user has
	protected $privs = array();	

	// List of alerts for this user
	private $alerts;
	
	// __construct
	// Set up this object for a passed in user
	public function User($username)
	{
		if ($username == false)
		{
			$this->username = false;
			$this->privs = array();
			return;
		}

		// Set the username
		$this->username = $username;
		$this->privs = $this->getPrivs();
		//$this->loadAlerts();
		//$this->alerts = new Alerts();
	}

	// login
	//
	// Attempt to authenticate the given username and password
	public function login($user, $pass) 
	{
		global $portal;

		// Create the SQL statement to get a user
		$sql = "SELECT *
				FROM users
				WHERE username = '$user' 
				AND	password = SHA1('$pass')";
		
		// Try to make this query, otherwise we die.
		$result = $portal->dbQuery($sql);

		// If only 1 user with that username / password exist
		if (mysql_num_rows($result) == 1) 
		{
			// Authenticated.
			$user_row = mysql_fetch_assoc($result);

			// Create the authenticated user object, and load their privledges
			return new User($user_row['username']);
		} 
		else 
		{ 
			//Not Authenticated
			//throw new portalUserException(2); // $PORTAL_CORE_AUTH_FAIL
			return NULL;
		}
	}

	// loadPrivs
	// Attempt to load privledges from the database
	public function getPrivs($user = null)
	{
		global $portal;

		// Get the privledges from the database
		if (!is_null($user))
			$sql = "SELECT * FROM privs WHERE username = '".$user."'";
		else
			$sql = "SELECT * FROM privs WHERE username = '".$this->username."'";

		$query = $portal->dbQuery($sql);

		$retPriv = array();

		while ($row = mysql_fetch_assoc($query))
		{
			if (!is_array($retPriv[$row['mod']]))
				$retPriv[$row['mod']] = array();

			array_push($retPriv[$row['mod']], $row['priv']);
		}

		return $retPriv;
	}

/**
	* NOT IMPLEMENTED
	public function loadAlerts()
	{
		$dbConnection = new databaseConnection();

		// Get the alerts from the database
		$sql = "SELECT * FROM alerts WHERE
				username = '".$this->username."'";

		// Get the serialized object from the database
		$query = $dbConnection->portalDatabaseQuery($sql);
		$count = mysql_num_rows($query);
		$result = mysql_fetch_assoc($query);
		
		// If there is Alerts in the DB
		if ($count == 1)
		{
			// Unseralize the object and set it to the alerts
			if ($a = unserialize($result['alert']))
				$this->alerts= $a;
		}
		else
		{
			$this->alerts = new Alerts();
		}
	}
*/

	// Update Privs
	// THIS CAN BE MUCH NICER!
	// Take the privledge list, and write them to the database.
	public function updatePrivs($pList, $user = null)
	{
		global $portal;

		if (is_null($user))
			$user = $this->username;

		$delSect = array();
		// Incoming list has a list of Modules with changes.  DON'T make changes to others.
		foreach ($pList as $mod=>$key)
		{
			array_push($delSect, $mod);
		}

		foreach ($delSect as $val)
		{
			// Find Old Privs
			$sql = "DELETE FROM privs where privs.username = '".$user."' and privs.mod = '".$val."'";
			$result = $portal->dbQuery($sql);
		}

		foreach ($pList as $mod=>$key)
		{
			foreach ($key as $num=>$priv)
			{
				$sql = "INSERT INTO privs (`priv_id`, `priv`, `mod`, `username`)
				VALUES (NULL, '".$priv."', '".$mod."', '".$user."')";
				$result = $portal->dbQuery($sql);
			}
		}
	}

	// updateUserstruct
	//
	// Update user information
	public function updateUserstruct($struct, $user = null)
	{
		global $portal;

		if (is_null($user))
			$user = $this->username;

		foreach ($struct as $key=>$val)
		{
			$sql = "UPDATE `users` SET `".strtolower($key)."` = '".$val."' WHERE `username` = '".$user."'";
			$result = $portal->dbQuery($sql);
		}

	}
	
	// hasPriv
	//
	// Checks to see if a given user has a specified privledge
	public function hasPriv($mod, $priv, $user = null)
	{
		if (!is_null($user))
			$chkPriv = $this->getPrivs($user);
		else
			$chkPriv = $this->privs;

		if (isset($chkPriv["SYSTEM"]))
			if (in_array("ALLACCESS", $chkPriv["SYSTEM"]))
				return true;

		if ($mod == "PUBLIC")
			return true;

		if (is_null($chkPriv[$mod]))
			return false;

		// See if it exists in our priv array
		return in_array($priv, $chkPriv[$mod]);
	}

/**
	* NOT IMPLEMENTED
	public function getAlerts()
	{
		return $this->alerts();
	}
*/

	// getUsername
	//
	// Return this objects username
	public function getUsername()
	{
		return $this->username;
	}

	public function reloadPrivs()
	{
		$this->privs = $this->getPrivs();
	}

	public function updatePassword ($password, $user = null)
	{
		global $portal;

		if (is_null($user))
			$user = $this->username;

		$sql = "UPDATE users SET password = MD5('$password') WHERE username = '$user'";
		$portal->dbQuery($sql);
	}
}
?>
