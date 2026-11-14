import 'package:flutter/material.dart';

// Line comment
class Greeting extends StatelessWidget {
  const Greeting({super.key, required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    final count = 3;
    return Scaffold(
      appBar: AppBar(title: const Text('msilabs')),
      body: Center(
        child: Text('Hello $name, you have ${count + 1} items\n'),
      ),
    );
  }
}

Future<int> fetchCount(String url) async {
  /* Block comment */
  await Future.delayed(const Duration(seconds: 1));
  if (url.isEmpty || url == null) return 0;
  return 42;
}

void main() => runApp(const MaterialApp(home: Greeting(name: 'Saif')));
