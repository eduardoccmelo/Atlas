import { createContext, useContext, useEffect, useMemo, useState } from "react";

const translations = {
  pt: {
    "Every journey, beautifully remembered.": "Cada viagem, lindamente lembrada.",
    "Plan the details, keep the memories, and see your world unfold.": "Planeje os detalhes, guarde as memórias e veja seu mundo se revelar.",
    "MY TRIPS": "MINHAS VIAGENS", "MY TRAVEL MAP": "MEU MAPA DE VIAGENS", "ADD A TRIP": "ADICIONAR VIAGEM",
    "You don't have any trips yet": "Você ainda não tem viagens.", "Travel Map": "Mapa de viagens",
    "View": "Ver", "Edit": "Editar", "TRIP DETAILS": "DETALHES DA VIAGEM", "START": "INÍCIO", "END": "FIM",
    "Transport": "Transporte", "Accommodation": "Hospedagem", "Plan & expenses": "Planejamento e despesas",
    "Notes": "Notas", "SIGHTSEEINGS": "PONTOS TURÍSTICOS", "EXPENSES": "DESPESAS", "Total:": "Total:",
    "Not added yet": "Ainda não adicionado", "No transport has been added yet.": "Nenhum transporte adicionado.",
    "No accommodation has been added yet.": "Nenhuma hospedagem adicionada.", "No notes have been added yet.": "Nenhuma nota adicionada.",
    "Edit trip": "Editar viagem", "Back to trips": "Voltar às viagens", "Places on this trip": "Lugares nesta viagem",
    "Only confirmed autocomplete selections are shown on the map.": "Apenas seleções confirmadas no autocomplete aparecem no mapa.",
    "TRAVEL MAP": "MAPA DE VIAGENS", "COUNTRY NAME": "NOME DO PAÍS", "Find a country...": "Buscar um país...",
    "LOADING COUNTRIES…": "CARREGANDO PAÍSES…", "NO RESULTS": "SEM RESULTADOS",
    "You didn't select any Country yet": "Você ainda não selecionou nenhum país",
    "NEW TRIP": "NOVA VIAGEM", "TRIP ESSENTIALS": "INFORMAÇÕES DA VIAGEM", "Destination Name": "Nome do destino",
    "New Sightseeing": "Novo ponto turístico", "New Expense": "Nova despesa", "Add": "Adicionar", "Remove": "Remover",
    "Page Not Found": "Página não encontrada", "Go to home page": "Ir para a página inicial",
    "TRANSPORT": "TRANSPORTE", "MAIN JOURNEY": "VIAGEM PRINCIPAL", "CAR RENTAL": "ALUGUEL DE CARRO",
    "TYPE": "TIPO", "AIRLINE": "COMPANHIA AÉREA", "BUS COMPANY": "EMPRESA DE ÔNIBUS", "TRAIN COMPANY": "EMPRESA DE TREM",
    "BOOKING / TICKET NUMBER": "NÚMERO DA RESERVA / BILHETE", "RESERVATION CODE": "CÓDIGO DA RESERVA",
    "FLIGHT NUMBER": "NÚMERO DO VOO", "TICKET / TRAIN NUMBER": "BILHETE / NÚMERO DO TREM", "SEAT(S)": "ASSENTO(S)",
    "DEPARTURE DATE": "DATA DE PARTIDA", "ARRIVAL DATE": "DATA DE CHEGADA", "DEPARTURE TIME": "HORA DE PARTIDA", "ARRIVAL TIME": "HORA DE CHEGADA",
    "DEPARTURE PLACE": "LOCAL DE PARTIDA", "ARRIVAL PLACE": "LOCAL DE CHEGADA", "DISTANCE": "DISTÂNCIA", "DURATION": "DURAÇÃO",
    "STARTING POINT": "PONTO DE PARTIDA", "DESTINATION": "DESTINO", "DRIVING DISTANCE": "DISTÂNCIA DE CARRO", "ESTIMATED DRIVE TIME": "TEMPO ESTIMADO", "AVERAGE SPEED": "VELOCIDADE MÉDIA",
    "Calculated from route": "Calculado pela rota", "Duration (calculated)": "Duração (calculada)", "Distance (calculated)": "Distância (calculada)",
    "I will rent a car": "Vou alugar um carro", "PICK-UP DATE": "DATA DE RETIRADA", "DROP-OFF DATE": "DATA DE DEVOLUÇÃO", "PICK-UP TIME": "HORA DE RETIRADA", "DROP-OFF TIME": "HORA DE DEVOLUÇÃO",
    "Plane": "Avião", "Bus": "Ônibus", "Train": "Trem", "Car": "Carro", "Add transport": "Adicionar transporte", "Add accommodation": "Adicionar hospedagem",
    "SAVE TRIP": "SALVAR VIAGEM", "CANCEL": "CANCELAR", "Airport": "Aeroporto", "City": "Cidade", "Company name": "Nome da empresa", "Street address or city": "Endereço ou cidade",
  },
};

const LanguageContext = createContext({ language: "en", setLanguage: () => {} });

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("atlas-language");
    if (savedLanguage) return savedLanguage;
    return navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "en";
  });
  useEffect(() => {
    localStorage.setItem("atlas-language", language);
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (text) => translations[language]?.[text] || text }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() { return useContext(LanguageContext); }

export function LanguageSwitcher({ className = "" }) {
  const { language, setLanguage } = useTranslation();
  return <div className={`languageSwitcher ${className}`} aria-label="Language selector">
    <button aria-label="English" title="English" className={language === "en" ? "isActive" : ""} onClick={() => setLanguage("en")}>🇬🇧</button>
    <button aria-label="Português (Brasil)" title="Português (Brasil)" className={language === "pt" ? "isActive" : ""} onClick={() => setLanguage("pt")}>🇧🇷</button>
  </div>;
}
