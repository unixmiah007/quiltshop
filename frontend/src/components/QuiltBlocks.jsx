export default function QuiltBlocks() {
  const blocks = Array.from({ length: 18 })
  return (
    <div className='quilt-grid'>
      {blocks.map((_, i) => (
        <div key={i} className='quilt-tile'>
          <div style={{ transform: `rotate(${(i%4)*90}deg)` }} />
        </div>
      ))}
    </div>
  )
}
