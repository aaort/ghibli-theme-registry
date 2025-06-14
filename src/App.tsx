import { Button } from "./components/ui/button";
import { ModeToggle } from "./components/ui/mode-toggle";

function App() {
  return (
    <div className="max-w-xl mx-auto my-12 rounded-lg border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Custom Registry</h1>
        <ModeToggle />
      </div>
      <p className="mb-4">Add your custom components here to preview them.</p>

      <Button variant="ghost">Click me </Button>
    </div>
  );
}

export default App;
