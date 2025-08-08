import { Button } from "src/@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "src/@/components/ui/dropdown-menu";
import { Card, CardDescription, CardTitle } from "src/@/components/ui/card";
import { PersonIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col fixed top-0 left-0 opacity-75 hover:opacity-95 z-10 backdrop-blur-lg w-full">
      <nav className="flex items-center justify-between bg-gray-900 px-6 py-2 w-full text-white ">
        <div
          className="font-bold text-xl flex gap-2 items-center cursor-pointer"
          onClick={() => {
            navigate("/");
            window.scroll({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          }}
        >
          <img
            className="h-12 object-fill p-4 scale-[2.5] rounded-full"
            src={process.env.PUBLIC_URL + "/images/baseballAppLogo.webp"}
            alt="Home Run Hub Logo"
          ></img>
          <span className="hover:text-white cursor-pointer">Home Run Hub</span>
        </div>
        <div>
          <Button variant={"default"} onClick={() => navigate("/standings")}>
            Standings
          </Button>
          <Button variant={"default"} onClick={() => navigate("/feed")}>
            Feed
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default">Company</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 bg-gray-900 border-gray-700">
              <DropdownMenuLabel>
                <Card
                  className="flex gap-4 bg-inherit items-center justify-center p-2 text-white border-none cursor-pointer hover:bg-gray-600"
                  onClick={() => navigate("/about")}
                >
                  <PersonIcon></PersonIcon>
                  <div>
                    <CardTitle>About</CardTitle>
                    <CardDescription className="text-slate-400">
                      Meet the team
                    </CardDescription>
                  </div>
                </Card>
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant={"default"} onClick={() => navigate("/contact")}>
            Contact
          </Button>
        </div>
      </nav>
      <hr className="opacity-25 "></hr>
    </div>
  );
};

export default NavBar;
