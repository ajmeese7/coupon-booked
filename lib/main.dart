import 'package:flutter/material.dart';
import 'SQLmanipulation.dart' as SQL;

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Coupon Book',
      theme: ThemeData(
        primarySwatch: Colors.deepPurple[900],
      ),
      home: MyHomePage(title: 'Coupon Book'),
    );
  }
}

// Home page of the application. It is stateful, meaning
// that it has a State object (defined below) that contains 
// fields that affect how it looks.
class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text(widget.title),
      ),
      body: Center(
        // Press p to see widget wireframes
        child: Column(
          // mainAxisAlignment to centers the children vertically; 
          // the main axis here is the vertical axis because Columns
          // are vertical (the cross axis would be horizontal).
          mainAxisAlignment: MainAxisAlignment.center,
        ),
      ),
    );
  }
}
