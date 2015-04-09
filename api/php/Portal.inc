<? 
/**
  * Portal.inc
  * 
  * This file contains the core connection object class.
  * The class Portal is used for many purposes,
  * first checking login authentication, and with having
  * modules register with the session.  It also handles
  * checking privledges against the current user.
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

include ("config.inc");
include ("Database.inc");
include ("User.inc");
include ("Links.inc");
include ("PortalException.inc");

class Portal 
{
	// Authenticated User Account
	private $authUser;

	// Menus and Privledges
	private $moduleMenus = array();
	private $modulePrivs = array();

	// Connection to the Database
	private $dbConnection;

	// Constructor
	// Establish the authentication subsystem
	function Portal ()
	{
		// Register System Privledges
		$this->registerSysPriv();

		// Connect to the DB
		$this->dbConnection = new databaseConnection();

		// Create null unprivledged user.
		$this->authUser = new User(false); 
	}
	
///////////////////////
// Private Functions //
///////////////////////

	private function registerSysPriv()
	{
		$this->registerPriv("SYSTEM", "CHANGEPW");
		$this->registerPriv("SYSTEM", "ADDACCOUNT");
		$this->registerPriv("SYSTEM", "DELACCOUNT");
		$this->registerPriv("SYSTEM", "MODSYSTEM");
		$this->registerPriv("SYSTEM", "ALLACCESS");
	}

///////////////////////////
// End Private Functions //
///////////////////////////

//////////////////////////////
// Generic Public Functions //
//////////////////////////////
	
	// loadModules
	// Load the modules available into the system.
	public function loadModules() 
	{
		// Create a new directoryIterator object to search through the 
		// module directory
		$dir = new DirectoryIterator(PORTALROOT.'modules/');

		// For each valid directory
		while ($dir->valid()) 
		{
			// Get the directory name
			$mod_name = $dir->current();

			// If the first 4 characters of this directory are mod_ then...
			if (substr($mod_name, 0, 4) == "mod_") 
			{
				// If the module load file exists.
				if (file_exists(PORTALROOT."modules/".
					$mod_name."/".substr($mod_name,4)."_load.php")) 
				{
					// Load the module
					require_once(PORTALROOT."modules/".$mod_name.
						"/".substr($mod_name,4)."_load.php");
				}
			}

			// Move to the next directory
			$dir->next();
		}
	}

	// isAuth
	//
	// See if the current user is authenticated to the system in some way
	public function isAuth()
	{
		if ((!is_null($this->authUser))
			 && ($this->authUser->getUsername() != "")
			 && ($this->authUser->getUsername() != NULL))
				return true;
		return false;
	}

	// dbQuery
	//
	// Just call the DB query function, it will handle the rest
	public function dbQuery($sql)
	{
		return $this->dbConnection->portalDatabaseQuery($sql);
	}

	// escapeString
	//
	// Will escape the string for our XSLT parser, and sanatize it for SQL
	public function escapeString($str)
	{
		$str = preg_replace("/\"(?=[^<>]*<)/","&quot;", $str);
		$str = preg_replace('/&(?![a-z]+;)/i', '&amp;', $str); 
		$ret = $this->dbConnection->escapeString($str);
		return ($ret);
	}

////////////////////////
// End Generic Public //
////////////////////////

/////////////////////
// User Management //
/////////////////////
	// login
	//
	// Attempt to log a given user with a password into the system
	public function login($user, $pass) 
	{
		$this->authUser = User::login($user, $pass);

		// Did not authenticate user
		if (!$this->authUser)
			return false;

		return true;
	}

	public function newUser($username)
	{
		$sql = "INSERT INTO `users` (`username`) VALUES ('$username')";
		$this->dbQuery($sql);
	}

	public function deleteUser($username)
	{
		$sql = "DELETE FROM `users` WHERE username = '".$username."'";
		$this->dbQuery($sql);

		$sql = "DELETE FROM `privs` WHERE username = '".$username."'";
		$this->dbQuery($sql);
	}

	public function hasPriv($mod, $priv, $user = null)
	{
		// NEED TO CHECK THAT THE CURRENT USER HAS AUTH TO CHECK ANOTHER USER
		// Or, some other security kinda thing....unknown
		// if ($this->hasPriv("ACCOUNT", "OTHER_EDIT")

		if (isset($this->authUser))
			return $this->authUser->hasPriv($mod, $priv, $user);
		else
			return false;
	}

	public function updatePrivs($pList, $user = null)
	{
		$this->authUser->updatePrivs($pList, $user);
	}

	public function getUsername()
	{
		return $this->authUser->getUsername();
	}

	public function getUser($username)
	{
		$sql = "SELECT * FROM users WHERE username = '".$username."'";
		$result = $this->dbQuery($sql);
		return mysql_fetch_assoc($result);
	}

	public function updateUserstruct($struct, $user = null)
	{
		$this->authUser->updateUserstruct($struct, $user);
	}

	public function updatePassword($password, $user = null)
	{
		$this->authUser->updatePassword($password, $user);
	}

	public function reloadPrivs()
	{
		$this->authUser->reloadPrivs();
	}

/////////////////////////
// End User Management //
/////////////////////////

////////////////////
// Module  System //
////////////////////
	// registerMenu
	// Register a menu with the portal system
	public function registerMenu($menu) 
	{
		// If the menu is currently not in the system, add it.
		if (!in_array($menu, $this->moduleMenus))
			array_push($this->moduleMenus, $menu);
	}

	// registerPriv
	// Register a privledge with the portal system
	public function registerPriv($mod, $priv) 
	{
		if (!is_array($this->modulePrivs[$mod]))
			$this->modulePrivs[$mod] = array();

		if (is_array($priv))
		{
			foreach ($priv as $p)
			{
				if (in_array($p, $this->modulePrivs[$mod]))
					continue;

				array_push($this->modulePrivs[$mod], $p);
				array_unique($this->modulePrivs[$mod]);
			}
		}
		else
		{
			if (in_array($priv, $this->modulePrivs[$mod]))
				return;

			array_push($this->modulePrivs[$mod], $priv);
			array_unique($this->modulePrivs[$mod]);
		}
	}

	// getModMenus
	// Return the menus registered with the system
	public function getModMenus() 
	{
		return $this->moduleMenus;
	}

	// getModPrivs
	// Get the privledges registered with the system
	public function getSysPrivs() 
	{
		return $this->modulePrivs; 
	}
/////////////////
//     END     //
/////////////////
}
?>
