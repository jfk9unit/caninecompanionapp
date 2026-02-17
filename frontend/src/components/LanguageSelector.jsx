import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { toast } from "sonner";

export const LanguageSelector = () => {
  const [languages, setLanguages] = useState({});
  const [currentLang, setCurrentLang] = useState("en-GB");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const [langsRes, currentRes] = await Promise.all([
        axios.get(`${API}/settings/languages`),
        axios.get(`${API}/settings/language`, { withCredentials: true }).catch(() => ({ data: { language: "en-GB" } }))
      ]);
      setLanguages(langsRes.data.languages);
      setCurrentLang(currentRes.data.language);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  };

  const handleLanguageChange = async (langCode) => {
    setLoading(true);
    try {
      await axios.post(`${API}/settings/language`, {
        language: langCode
      }, { withCredentials: true });
      
      setCurrentLang(langCode);
      toast.success(`Language changed to ${languages[langCode]?.name}`);
      
      // In a real app, this would trigger a full translation reload
      // For now, we just update the state
    } catch (error) {
      toast.error("Failed to change language");
    } finally {
      setLoading(false);
    }
  };

  const currentLanguage = languages[currentLang];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          disabled={loading}
          data-testid="language-selector"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLanguage?.flag} {currentLanguage?.name}</span>
          <span className="sm:hidden">{currentLanguage?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(languages).map(([code, lang]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`gap-3 ${currentLang === code ? 'bg-primary/10 text-primary' : ''}`}
            data-testid={`lang-option-${code}`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="flex-1">{lang.name}</span>
            {currentLang === code && <span className="text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
