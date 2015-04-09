<?
class Header
{
	private $header;
	private $linkList;
	
	public function Header ($header)
	{
		$this->header = $header;
	}

	public function addLink ($link)
	{
		$this->linkList[] = $link;
	}

	public function out ($menu)
	{
		$dm = $menu->addDropMenu(new DropMenu($this->header));

		for ($i = 0; $i < sizeof($this->linkList); $i++)
		{
			$link = $this->linkList[$i];
			$link->out($dm);
		}
	}
}

class Link
{
	private $name;
	private $link;
	private $mod;
	private $priv;

	public function Link ($name, $link, $mod = null, $priv = null)
	{
		$this->name = $name;
		$this->link = $link;
		$this->priv = $priv;
		$this->mod = $mod;
	}

	public function out ($dm)
	{
		global $portal;

		if (($this->priv == "" && $portal->isAuth()) || $portal->hasPriv($this->mod, $this->priv))
			$dm->addMenuItem(new MenuItem($this->priv, "", $this->name, PORTALROOT . $this->link));
	}
}
?>
