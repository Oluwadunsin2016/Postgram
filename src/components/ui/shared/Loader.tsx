import { Spinner } from "@nextui-org/react";

type LoaderProps = {
  label?: string;
  fullScreen?: boolean;
  className?: string;
};

const Loader = ({ label, fullScreen = false, className = "" }: LoaderProps) => {
  return (
    <div className={`flex-center justify-center ${fullScreen ? "min-h-screen" : "min-h-40"} ${className}`}>
      <div className="flex flex-col items-center gap-3 text-light-3">
        <Spinner size="lg" color="primary" />
        {label && <span className="small-medium">{label}</span>}
      </div>
    </div>
  );
};

export default Loader;
