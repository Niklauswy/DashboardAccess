import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button"; // shadcn button component
import { Menu } from "lucide-react"; // lucide icon

export function CustomTrigger(props) {
  const { toggleSidebar } = useSidebar();
  const handleClick = () => {
    toggleSidebar();
    if (props.onClick) props.onClick();
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleClick} 
      className="p-2 shadow-md hover:shadow-lg transition"
    >
      <Menu className="" />
    </Button>
  );
}
