<?
include ('basePath.inc');
class Menu 
{
	private $dropList = array();

	public function addDropMenu($dropMenu)
	{
		$this->dropList[] = $dropMenu;
		return $dropMenu;
	}

	public function out()
	{
		echo "<MenuBar>\n";
		foreach ($this->dropList as $dl)
		{
			$dl->out();
		}
		echo "</MenuBar>\n";
	}
}

class DropMenu 
{
	private $menuItemList = array();
	private $menuName;
	private $authed=false;

	public function DropMenu($name)
	{
		$this->menuName = $name;
	}

	public function addMenuItem($menuItem)
	{
		$this->menuItemList[] = $menuItem;
		if ($menuItem->isAuthed())
		{
			$this->authed=true;
		}
		return $menuItem;
	}

	public function out()
	{
		if (!$this->authed)
			return;
		echo "<Menu>\n";
		echo "<caption>$this->menuName</caption>\n";
		foreach ($this->menuItemList as $mi)
		{
			$mi->out();
		}
		echo "</Menu>\n";
	}

	public function isAuthed()
	{
		return $this->authed;
	}
}

class MenuItem 
{
	private $privRequired;
	private $image;
	private $altText;
	private $reference;
	private $authed;

	public function MenuItem($priv, $img, $alt, $href)
	{
		global $portal;
		$this->privRequired=$priv;
		$this->image=$img;
		$this->altText=$alt;
		$this->reference=$href;
		$this->authed = true;

		//PRIVS HERE
	}

	public function out()
	{
		if ($this->authed)
		{
			?>
				<MenuItem href='<?=$this->reference?>'>
				<caption>
				<?if (isset($this->image) && $this->image != ''){?>
					<img src='<?=$this->image?>' border='0' align='center'/>
						<?}?>
				<?=$this->altText?>
				</caption>
				</MenuItem>
				<?
		}
	}

	public function isAuthed()
	{
		return $this->authed;
	}
}
