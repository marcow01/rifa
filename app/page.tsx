import  Navbar from "@/components/navbar";
import Main from "@/components/main";
import RankingMain from "@/components/ranking";

export default function Page() {

return (
    <>
    <Navbar></Navbar>
    <Main></Main>
    <RankingMain></RankingMain>

    <div className="flex flex-col items-center justify-center text-center py-6">
        <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">
                2026, Todos os direitos reservados. ©
            </span>
            
            <a href="https://transparencyreport.google.com/safe-browsing/search" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-90 transition-opacity">
            <img 
            
                className="w-44 mt-2" 
                src="https://incs-bucket.s3.us-east-1.amazonaws.com/assets/google-report.png" 
                alt="Google Report" 
            />
  </a>

        </div>     
    </div>
    
    </>
);
}