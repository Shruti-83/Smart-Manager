const TypingIndicator = ({ name }) => {
  return (
    <div className="text-xs text-gray-500 italic flex items-center gap-1">
      {name} is typing
      <span className="flex gap-[2px]">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </span>
    </div>
  );
};
export default TypingIndicator;