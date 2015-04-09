<?
require_once( 'menu.inc' );

$menu = new Menu();
$main = $menu->addDropMenu(new DropMenu("Main"));

$main->addMenuItem( 
    new MenuItem(true, 
                 "",
                 'Home', 
                 PORTALROOT . "index.php"
	)
);

if (!$portal->isAuth())
{
	$main->addMenuItem( 
	    new MenuItem(true, 
	                 "",
	                 'Login', 
	                 PORTALROOT . "login.php"
		)
	);
}

if ($portal->isAuth() || true)
{
	$main->addMenuItem( 
	    new MenuItem(true, 
	                 "",
	                 'Logout', 
	                 PORTALROOT . "index.php?action=logout"
		)
	);
}

if ($portal->isAuth())
{
	$main->addMenuItem(
		new MenuItem(true,
								 "",
								 'Reload Privs',
								 PORTALROOT . "index.php?action=reload"
		)
	);
}

foreach ($portal->getModMenus() as $mod)
{
	$mod->out($menu);	
}

$menu->out();
?>
