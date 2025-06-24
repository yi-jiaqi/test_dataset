// Reusable utility functions
class SketchUtils {
	static gcd(a, b) {
	  // Euclidean algorithm to find GCD
	  while (b !== 0) {
		let temp = b;
		b = a % b;
		a = temp;
	  }
	  return a;
	}
  
	static createControls(sketchInstance) {
	  const controls = document.createElement('div');
	  controls.className = 'controls';
	  
	  const resetBtn = document.createElement('button');
	  resetBtn.textContent = 'Reset Sketch';
	  resetBtn.addEventListener('click', () => sketchInstance.resetSketch());
	  
	  const aspectSelect = document.createElement('select');
	  const ratios = [
		{value: '9:21', label: '9:21 (Default)'},
		{value: '3:5', label: '3:5'},
		{value: '9:16', label: '9:16'},
		{value: '1:1', label: '1:1 (Square)'},
		{value: '16:9', label: '16:9 (Widescreen)'}
	  ];
	  
	  ratios.forEach(ratio => {
		const option = document.createElement('option');
		option.value = ratio.value;
		option.textContent = ratio.label;
		aspectSelect.appendChild(option);
	  });
	  
	  aspectSelect.addEventListener('change', (e) => {
		const [w, h] = e.target.value.split(':').map(Number);
		sketchInstance.changeAspectRatio(w, h);
	  });
	  
	  controls.appendChild(resetBtn);
	  controls.appendChild(aspectSelect);
	  
	  return controls;
	}
  }